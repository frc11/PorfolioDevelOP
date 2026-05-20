# Formato CSV para bulk import de clientes

## Columnas requeridas (en este orden)

| Columna | Tipo | Ejemplo |
|---|---|---|
| organizationName | string | Clínica San Miguel |
| userEmail | email | maria@sanmiguel.com |
| userName | string | María Pereyra |
| industry | enum (ver abajo) | medico_odontologico |
| city | string | Tucumán |
| whatsappNumber | string con código país | 5493814111111 |

## Columnas opcionales

| Columna | Tipo | Ejemplo |
|---|---|---|
| website | URL | https://sanmiguel.com |
| userPhone | string | 3814111111 |

## Industrias válidas

| Valor | Descripción |
|---|---|
| legal | Estudio jurídico / abogados |
| contable | Estudio contable / impositivo |
| medico_odontologico | Clínica médica u odontológica |
| gimnasio | Gimnasio / centro fitness |
| restaurant | Restaurante / gastronomía |
| inmobiliaria | Inmobiliaria |
| concesionaria | Concesionaria de autos |
| distribuidora | Distribuidora / mayorista |
| constructora | Constructora / empresa de obra |
| generico | Cualquier otro rubro |

Si el valor de `industry` no coincide con ninguno de los anteriores, se usa `generico` automáticamente.

## Reglas del CSV

- Primera fila: headers exactos (case sensitive)
- Separador: coma `,`
- **No usar comas dentro de los valores** (no se soporta quoting por ahora)
- Codificación: UTF-8
- Máx. recomendado: 50 filas por archivo (el proceso es síncrono)

## Ejemplo

```csv
organizationName,userEmail,userName,industry,city,whatsappNumber,website,userPhone
Clínica San Miguel,maria@sanmiguel.com,María Pereyra,medico_odontologico,Tucumán,5493814111111,https://sanmiguel.com,3814111111
Estudio Legal Norte,lautaro@studio.com,Lautaro Pérez,legal,Salta,5493874444444,,
```

## CSV de prueba (con error esperado en fila 3)

```csv
organizationName,userEmail,userName,industry,city,whatsappNumber
Test Org 1,test1@example.com,Cliente 1,medico_odontologico,Tucumán,5493811111111
Test Org 2,cliente@sanmiguel.com,Cliente Duplicado,legal,Salta,5493811111112
Test Org 3,test3@example.com,Cliente 3,generico,Córdoba,5493811111113
```

Resultado esperado: 2 éxitos, 1 error (fila 3 falla si `cliente@sanmiguel.com` ya está registrado).

## Qué genera el sistema por cada fila exitosa

- Organización con `onboardingCompleted: true`
- Usuario con rol `ORG_MEMBER` y `passwordResetRequired: true`
- BotConfig con nombre "Asistente" y KB pre-cargada según la industria
- Email de bienvenida con password temporal
- Audit log con `source: bulk_import`
