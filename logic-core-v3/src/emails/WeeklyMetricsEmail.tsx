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

interface WeeklyMetricsEmailProps {
  clientName?: string
  month?: string
  aiBrief?: string
  reportUrl?: string
}

export const WeeklyMetricsEmail = ({
  clientName = 'Estimado Cliente',
  month = 'Marzo 2026',
  aiBrief = 'El rendimiento del ecosistema digital B2B ha sido sobresaliente esta quincena. Las conversiones crecieron de forma automatizada por nuestras macros de retargeting en LinkedIn.',
  reportUrl = 'https://develop-agency.com/dashboard/analytics',
}: WeeklyMetricsEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Resultados B2B Listos y Reporte Ejecutivo mensual ({month}).</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>
              devel<span style={logoAccent}>OP</span>
            </Text>
          </Section>
          
          <Section style={content}>
            <Heading style={heading}>Executive Report Listo - {month}</Heading>
            <Text style={paragraph}>Hola {clientName},</Text>
            <Text style={paragraph}>
              Hemos sintetizado exhaustivamente los resultados operativos de tu sistema durante este período. Nuestra IA ("AI Executive Brief") y nuestros analistas técnicos concluyeron:
            </Text>

            <Section style={aiBox}>
              <Text style={aiText}>
                "{aiBrief}"
              </Text>
            </Section>
            
            <Text style={paragraph}>
              Puedes descargar el **Documento PDF Analítico íntegro** directo desde tu Portal, el cual incluye las horas máquina ahorradas y el ROI escalado de nuestra infraestructura este mes.
            </Text>
            
            <Section style={buttonContainer}>
              <Button style={button} href={reportUrl}>
                Acceder y Descargar Reporte
              </Button>
            </Section>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Protegido criptográficamente - Este es un aviso seguro del ecosistema develOP B2B. No exponga estos links.
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
  color: '#10b981', // emerald for analytics reports
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

const aiBox = {
  padding: '20px',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderLeft: '4px solid #10b981',
  borderRadius: '4px',
  marginBottom: '24px',
}

const aiText = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#e4e4e7',
  fontStyle: 'italic',
  margin: '0',
}

const buttonContainer = {
  marginTop: '32px',
  marginBottom: '32px',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#10b981',
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

export default WeeklyMetricsEmail
