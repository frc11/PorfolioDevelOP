/**
 * Núcleo genérico del helper de aislamiento. El contrato público y la relación
 * con el patrón LeadOS están documentados en src/lib/isolation/index.ts; los
 * modelos cubiertos y sus estrategias, en src/lib/isolation/registry.ts.
 *
 * Una instancia de ScopedModelDelegate envuelve un delegate de Prisma con el
 * scope de UNA organización fijado en el constructor. Invariantes:
 *
 *   - Lecturas: el `where` del caller se compone con AND contra el fragmento
 *     de scope — nunca lo reemplaza. Un organizationId ajeno en el where lanza.
 *   - create: el organizationId lo fija el scope (espejo de ownedLeadCreateData
 *     de LeadOS: el dueño lo deriva el sistema, jamás el cliente). Nested
 *     writes rechazados: cada fila entra por su propio accessor scoped.
 *   - update/delete por id: guard atómico `{ id, organizationId }` en modelos
 *     con columna propia; lectura scoped previa en modelos relacionales (el
 *     re-parenting está prohibido, así que la fila no puede cambiar de org
 *     entre el check y el write).
 *   - Un id de otra organización es indistinguible de un id inexistente
 *     (IsolationNotFoundError / null) — sin leak de existencia cross-tenant,
 *     mismo criterio que getLeadByIdForOrg del chatbot.
 */
import { Prisma } from '@prisma/client'

/** Error base del helper: violaciones del contrato de aislamiento. */
export class IsolationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'IsolationError'
  }
}

/**
 * "No existe EN TU organización": cubre tanto el id inexistente como el id de
 * otra org — deliberadamente indistinguibles para no filtrar existencia.
 */
export class IsolationNotFoundError extends IsolationError {
  constructor(model: string, ref: string, cause?: unknown) {
    super(`${model}: "${ref}" no existe en la organización del scope.`)
    this.name = 'IsolationNotFoundError'
    // Conserva el error original de Prisma (código, meta, stack) para debug.
    if (cause !== undefined) this.cause = cause
  }
}

/**
 * Args/data internos ya validados por las firmas públicas. El tipado fuerte
 * vive en la API (genéricos Prisma.Args/Prisma.Result y los tipos de write
 * del registro); estos Record son el canal interno hacia el delegate.
 */
type UnsafeArgs = Record<string, unknown>

/** Superficie mínima que el helper le exige a un delegate de Prisma en runtime. */
interface UnsafeDelegate {
  findMany(args: UnsafeArgs): Promise<unknown>
  findFirst(args: UnsafeArgs): Promise<unknown>
  count(args: UnsafeArgs): Promise<number>
  groupBy(args: UnsafeArgs): Promise<unknown>
  create(args: UnsafeArgs): Promise<unknown>
  createMany(args: UnsafeArgs): Promise<Prisma.BatchPayload>
  update(args: UnsafeArgs): Promise<unknown>
  updateMany(args: UnsafeArgs): Promise<Prisma.BatchPayload>
  delete(args: UnsafeArgs): Promise<unknown>
  deleteMany(args: UnsafeArgs): Promise<Prisma.BatchPayload>
  upsert(args: UnsafeArgs): Promise<unknown>
}

function asRecord(value: unknown): UnsafeArgs {
  return (value ?? {}) as UnsafeArgs
}

/** FK de create que apunta a un padre scoped y debe pertenecer a la org. */
export interface ParentCheck {
  /** Clave escalar del data (ej. 'botConfigId'). */
  field: string
  /**
   * Devuelve el padre SI pertenece a la org; null si no existe o es de otra.
   * Recibe el cliente ACTIVO (global o el `tx` de la transacción) para que, al
   * crear padre+hijo en la misma transacción, el check vea el padre recién
   * creado (aún no commiteado) en vez de leer fuera de la tx.
   */
  find(client: Prisma.TransactionClient, organizationId: string, id: string): Promise<unknown>
}

export interface ModelIsolationConfig {
  /** Nombre para mensajes de error (coincide con la key del scope). */
  model: string
  /** Fragmento where que fija el tenant (columna directa o filtro relacional). */
  scopeWhere(organizationId: string): UnsafeArgs
  /**
   * true → el modelo tiene columna organizationId propia: create la inyecta y
   * update/delete por id la usan como guard ATÓMICO (extended where unique).
   * false → scope relacional (vía botConfig / conversation.botConfig).
   */
  hasOrganizationId: boolean
  /**
   * Guards de create para modelos SIN constraint compuesto en la DB (chatbot).
   * Para los modelos del motor queda vacío: la FK compuesta
   * (organizationId, id) rechaza la referencia cross-org a nivel base.
   */
  parentChecks: readonly ParentCheck[]
  /** Claves rechazadas en data de create (objetos de relación → nested writes). */
  forbiddenCreateKeys: readonly string[]
  /** Claves rechazadas en update (nested writes + FKs de re-parenting + organizationId). */
  forbiddenUpdateKeys: readonly string[]
}

/**
 * Accessor scoped de un modelo. Genéricos:
 *   D          — tipo del delegate de Prisma (typeof prisma.modelo); da el
 *                tipado completo de args/result en las lecturas.
 *   Row        — fila del modelo (payload default) para los retornos simples.
 *   CreateData — input de create SIN organizationId ni relaciones anidadas.
 *   UpdateData — input de update SIN organizationId ni FKs de re-parenting.
 */
export class ScopedModelDelegate<D, Row, CreateData extends object, UpdateData extends object> {
  constructor(
    protected readonly delegate: D,
    protected readonly organizationId: string,
    protected readonly cfg: ModelIsolationConfig,
    /** Cliente activo (global `prisma` o el `tx` de la transacción). Lo usan los parentChecks. */
    protected readonly client: Prisma.TransactionClient,
  ) {}

  /** Canal runtime hacia el delegate; la seguridad de tipos vive en las firmas públicas. */
  protected get unsafe(): UnsafeDelegate {
    return this.delegate as unknown as UnsafeDelegate
  }

  async findMany<A extends Prisma.Args<D, 'findMany'>>(
    args?: Prisma.Exact<A, Prisma.Args<D, 'findMany'>>,
  ): Promise<Prisma.Result<D, A, 'findMany'>> {
    const a = asRecord(args)
    this.assertScopedReadArgs(a)
    const result = await this.unsafe.findMany({ ...a, where: this.scopedWhere(a.where) })
    return result as Prisma.Result<D, A, 'findMany'>
  }

  async findFirst<A extends Prisma.Args<D, 'findFirst'>>(
    args?: Prisma.Exact<A, Prisma.Args<D, 'findFirst'>>,
  ): Promise<Prisma.Result<D, A, 'findFirst'>> {
    const a = asRecord(args)
    this.assertScopedReadArgs(a)
    const result = await this.unsafe.findFirst({ ...a, where: this.scopedWhere(a.where) })
    return result as Prisma.Result<D, A, 'findFirst'>
  }

  /**
   * Lectura anti-IDOR por id (espejo de ownedLeadWhere de LeadOS): id + scope
   * en una sola query. Un id de otra organización devuelve null.
   */
  async findById(id: string): Promise<Row | null> {
    const result = await this.unsafe.findFirst({ where: this.scopedWhere({ id }) })
    return result as Row | null
  }

  async count(where?: Prisma.Args<D, 'count'>['where']): Promise<number> {
    return this.unsafe.count({ where: this.scopedWhere(where) })
  }

  /**
   * Agregación scoped: el `where` del caller se compone con AND contra el
   * fragmento de scope (idéntico a findMany). El `by`/`orderBy`/`having` viajan
   * tal cual — solo el universo de filas queda acotado al tenant.
   */
  async groupBy<A extends Prisma.Args<D, 'groupBy'>>(
    args: Prisma.Exact<A, Prisma.Args<D, 'groupBy'>>,
  ): Promise<Prisma.Result<D, A, 'groupBy'>> {
    const a = asRecord(args)
    this.assertScopedReadArgs(a)
    const result = await this.unsafe.groupBy({ ...a, where: this.scopedWhere(a.where) })
    return result as Prisma.Result<D, A, 'groupBy'>
  }

  async create(data: CreateData): Promise<Row> {
    const prepared = await this.prepareWriteData('create', data)
    try {
      return (await this.unsafe.create({ data: prepared })) as Row
    } catch (error) {
      throw this.translateDbError(error, 'create')
    }
  }

  /**
   * createMany scoped. Cada fila pasa por prepareWriteData: claves prohibidas
   * rechazadas, organizationId fijado por el scope (modelos con columna propia)
   * y parentChecks corridos (modelos relacionales) — mismas garantías que
   * create, fila por fila. Sin nested writes (createMany no los soporta).
   */
  async createMany(data: readonly CreateData[], options?: { skipDuplicates?: boolean }): Promise<Prisma.BatchPayload> {
    const prepared = await Promise.all(data.map((row) => this.prepareWriteData('create', row)))
    try {
      return await this.unsafe.createMany({ data: prepared, skipDuplicates: options?.skipDuplicates })
    } catch (error) {
      throw this.translateDbError(error, 'createMany')
    }
  }

  async update(id: string, data: UpdateData): Promise<Row> {
    const prepared = await this.prepareWriteData('update', data)
    if (this.cfg.hasOrganizationId) {
      try {
        // Guard atómico: where unique extendido { id, organizationId }. Si la
        // fila es de otra org, Prisma responde P2025 → IsolationNotFoundError.
        return (await this.unsafe.update({
          where: { id, organizationId: this.organizationId },
          data: prepared,
        })) as Row
      } catch (error) {
        throw this.translateDbError(error, id)
      }
    }
    // Modelos relacionales: el write viaja en UNA sentencia con el scope en el
    // MISMO where (updateMany acepta where no-unique) — sin ventana
    // check-then-write frente a escrituras concurrentes fuera del helper
    // (chatbot legacy hasta B0-S3). count 0 = no existe o no es de la org.
    const batch = await this.unsafe.updateMany({ where: this.scopedWhere({ id }), data: prepared })
    if (batch.count === 0) throw new IsolationNotFoundError(this.cfg.model, id)
    const updated = await this.findById(id)
    if (updated === null) throw new IsolationNotFoundError(this.cfg.model, id)
    return updated
  }

  async updateMany(args: {
    where?: Prisma.Args<D, 'updateMany'>['where']
    data: UpdateData
  }): Promise<Prisma.BatchPayload> {
    const prepared = await this.prepareWriteData('update', args.data)
    return this.unsafe.updateMany({ where: this.scopedWhere(args.where), data: prepared })
  }

  async delete(id: string): Promise<Row> {
    if (this.cfg.hasOrganizationId) {
      try {
        return (await this.unsafe.delete({
          where: { id, organizationId: this.organizationId },
        })) as Row
      } catch (error) {
        throw this.translateDbError(error, id)
      }
    }
    // Pre-lectura scoped SOLO para el valor de retorno; la garantía la da el
    // deleteMany con el scope en el mismo where (count 0 = no es de la org).
    const existing = await this.findById(id)
    if (existing === null) throw new IsolationNotFoundError(this.cfg.model, id)
    const batch = await this.unsafe.deleteMany({ where: this.scopedWhere({ id }) })
    if (batch.count === 0) throw new IsolationNotFoundError(this.cfg.model, id)
    return existing
  }

  async deleteMany(where?: Prisma.Args<D, 'deleteMany'>['where']): Promise<Prisma.BatchPayload> {
    return this.unsafe.deleteMany({ where: this.scopedWhere(where) })
  }

  // ── Internos ──────────────────────────────────────────────────────────────

  /**
   * Compone el where del caller con el fragmento de scope. AND: el caller
   * puede acotar, nunca ampliar. El fragmento va primero — es el que las
   * políticas RLS futuras van a reflejar.
   */
  protected scopedWhere(callerWhere?: unknown): UnsafeArgs {
    const scope = this.cfg.scopeWhere(this.organizationId)
    if (callerWhere === undefined || callerWhere === null) return scope
    this.assertNoForeignOrganizationId(callerWhere)
    return { AND: [scope, callerWhere] }
  }

  /**
   * Un organizationId distinto del scope en el where de primer nivel es un bug
   * del caller → lanza (no "devuelve vacío en silencio"). Si viniera anidado
   * (OR/AND), el AND de scopedWhere igual lo vuelve inofensivo: puede acotar
   * a cero filas, jamás alcanzar otra org.
   */
  private assertNoForeignOrganizationId(where: unknown): void {
    if (typeof where !== 'object' || where === null) return
    const candidate = (where as UnsafeArgs).organizationId
    if (candidate !== undefined && candidate !== this.organizationId) {
      throw new IsolationError(
        `${this.cfg.model}: el where trae un organizationId ajeno al scope. ` +
          'El tenant lo fija forOrg(); no se re-apunta por where.',
      )
    }
  }

  /**
   * `cursor` ancla la paginación resolviendo una fila por unique GLOBAL antes
   * de aplicar el where: un id de otra organización funcionaría como oráculo
   * de existencia/posición temporal. No está soportado a propósito — paginar
   * con where/orderBy/take/skip.
   */
  private assertScopedReadArgs(args: UnsafeArgs): void {
    if (args.cursor !== undefined) {
      throw new IsolationError(
        `${this.cfg.model}: "cursor" no está soportado por el helper de aislamiento ` +
          '(el ancla se resuelve por unique global y saltearía el scope). Paginá con where/orderBy/take/skip.',
      )
    }
  }

  /**
   * Valida y normaliza el data de escritura:
   *   1. claves prohibidas (nested writes; en update también re-parenting y
   *      organizationId) → IsolationError;
   *   2. en create de modelos con columna propia, fuerza organizationId del
   *      scope (un valor ajeno explícito lanza — es un bug del caller);
   *   3. en create, corre los parentChecks del registro (padres scoped de la
   *      misma org) — solo modelos sin constraint compuesto en DB.
   */
  protected async prepareWriteData(op: 'create' | 'update', data: object): Promise<UnsafeArgs> {
    const record: UnsafeArgs = { ...(data as UnsafeArgs) }
    const forbidden = op === 'create' ? this.cfg.forbiddenCreateKeys : this.cfg.forbiddenUpdateKeys
    for (const key of forbidden) {
      if (record[key] !== undefined) {
        throw new IsolationError(
          `${this.cfg.model}.${op}: la clave "${key}" no se acepta a través del helper de aislamiento.`,
        )
      }
    }
    if (op === 'update' && record.id !== undefined) {
      // Re-keying prohibido: cambiar el id re-escribe en cascada las FKs de
      // los hijos (onUpdate: Cascade) y rompe referencias externas.
      throw new IsolationError(`${this.cfg.model}.update: la clave "id" no es actualizable a través del helper.`)
    }
    if (op === 'create' && this.cfg.hasOrganizationId) {
      if (record.organizationId !== undefined && record.organizationId !== this.organizationId) {
        throw new IsolationError(
          `${this.cfg.model}.create: el organizationId del data no coincide con el scope. ` +
            'El dueño lo fija el sistema (forOrg), nunca el caller.',
        )
      }
      record.organizationId = this.organizationId
    }
    if (op === 'create' && this.cfg.parentChecks.length > 0) {
      // Checks independientes en paralelo: una etapa de latencia, no N.
      await Promise.all(
        this.cfg.parentChecks.map(async (check) => {
          const parentId = record[check.field]
          if (typeof parentId !== 'string') return
          const parent = await check.find(this.client, this.organizationId, parentId)
          if (parent === null) {
            throw new IsolationNotFoundError(this.cfg.model, `${check.field}=${parentId}`)
          }
        }),
      )
    }
    return record
  }

  /**
   * Traduce errores de Prisma al contrato del helper:
   *   - P2025 (record not found con el guard atómico) → IsolationNotFoundError.
   *   - P2003 (FK compuesta violada en un create del motor: el padre referido
   *     no es de esta org o no existe) → IsolationNotFoundError, nombrando el
   *     campo/constraint ofensor (meta de Prisma) para el triage en logs.
   * Mismo error en ambos casos: sin leak de existencia cross-org. El error
   * original de Prisma queda como `cause`.
   */
  protected translateDbError(error: unknown, ref: string): unknown {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') return new IsolationNotFoundError(this.cfg.model, ref, error)
      if (error.code === 'P2003') {
        const meta: Record<string, unknown> = error.meta ?? {}
        const detail =
          typeof meta.field_name === 'string'
            ? meta.field_name
            : typeof meta.constraint === 'string'
              ? meta.constraint
              : 'una FK del data'
        return new IsolationNotFoundError(
          this.cfg.model,
          `${ref} (${detail} apunta fuera de la organización del scope)`,
          error,
        )
      }
    }
    return error
  }
}
