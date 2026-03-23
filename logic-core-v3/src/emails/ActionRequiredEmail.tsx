import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface ActionRequiredEmailProps {
  clientName?: string
  taskName?: string
  dashboardUrl?: string
}

export const ActionRequiredEmail = ({
  clientName = 'Estimado Cliente',
  taskName = 'Nuevos Recursos',
  dashboardUrl = 'https://develop-agency.com/login',
}: ActionRequiredEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Acción requerida: {taskName} está listo para ti.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>
              devel<span style={logoAccent}>OP</span>
            </Text>
          </Section>
          
          <Section style={content}>
            <Heading style={heading}>Entregable Pendiente de Aprobación</Heading>
            <Text style={paragraph}>Hola {clientName},</Text>
            <Text style={paragraph}>
              El centro de operaciones de develOP ha completado exitosamente la fase estratégica de <strong>"{taskName}"</strong> y se encuentra lista en tu Bóveda B2B para tu revisión inmediata.
            </Text>
            
            <Section style={buttonContainer}>
              <Button style={button} href={dashboardUrl}>
                Ver Entregable en Dashboard
              </Button>
            </Section>
            
            <Text style={paragraph}>
              Por favor, revisa el material y apruébalo o déjanos comentarios sobre las iteraciones necesarias mediante las herramientas que tienes integradas en la plataforma. Tu validación en este paso acelera el embudo de ventas actual.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Este es un aviso cifrado y automático del panel corporativo develOP C-Level. No responda a este bot.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#0c0e12',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  width: '580px',
  backgroundColor: '#0c0e12',
}

const header = {
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  paddingBottom: '20px',
}

const logo = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0',
  letterSpacing: '-0.5px',
}

const logoAccent = {
  color: '#06b6d4',
}

const content = {
  padding: '30px 0',
}

const heading = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#ffffff',
  lineHeight: '1.4',
  marginBottom: '24px',
}

const paragraph = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#a1a1aa',
  marginBottom: '20px',
}

const buttonContainer = {
  marginTop: '32px',
  marginBottom: '32px',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#06b6d4',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '14px 24px',
}

const footer = {
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  paddingTop: '30px',
}

const footerText = {
  fontSize: '12px',
  color: '#52525b',
  lineHeight: '1.5',
  textAlign: 'center' as const,
}

export default ActionRequiredEmail
