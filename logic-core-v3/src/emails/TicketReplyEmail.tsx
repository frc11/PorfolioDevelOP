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
  Hr,
} from '@react-email/components'
import * as React from 'react'

interface TicketReplyEmailProps {
  clientName?: string
  ticketTitle?: string
  ticketId?: string
  ticketUrl?: string
}

export const TicketReplyEmail = ({
  clientName = 'Cliente',
  ticketTitle = 'Problema de acceso',
  ticketId = 'TKT-1234',
  ticketUrl = 'https://develop-agency.com/dashboard/soporte/ck94k1lma0',
}: TicketReplyEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Actualización en tu ticket #{ticketId}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>
              devel<span style={logoAccent}>OP</span>
            </Text>
          </Section>
          
          <Section style={content}>
            <Heading style={heading}>Actualización de Soporte B2B</Heading>
            <Text style={paragraph}>Hola {clientName},</Text>
            <Text style={paragraph}>
              El equipo de ingeniería de develOP ha respondido a tu ticket <strong>"{ticketTitle}"</strong> (#{ticketId}).
            </Text>
            
            <Section style={buttonContainer}>
              <Button style={button} href={ticketUrl}>
                Ver Respuesta en Dashboard
              </Button>
            </Section>
            
            <Hr style={hr} />
            
            <Text style={paragraph}>
              Operamos con un modelo asíncrono para garantizar que cada problema sea analizado a profundidad y resuelto de raíz, sin las presiones de un chat en vivo. Tu ecosistema está en buenas manos.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Este es un aviso automático del módulo de soporte develOP. No respondas a este correo.
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

const hr = {
  borderColor: 'rgba(255, 255, 255, 0.1)',
  margin: '20px 0',
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

export default TicketReplyEmail
