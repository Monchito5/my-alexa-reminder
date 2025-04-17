// Tiempo máximo permitido para la diferencia entre la marca de tiempo de la solicitud y la hora actual
const MAX_TIMESTAMP_DIFF_MS = 150000 // 150 segundos

// Función para validar la solicitud de Alexa
export default function alexaValidator(req) {
  try {
    // 1. Verificar que la solicitud proviene de Alexa
    if (!verifyAlexaRequest(req)) {
      return false
    }

    // 2. Verificar que el applicationId coincide
    if (!verifyApplicationId(req.body)) {
      return false
    }

    // 3. Verificar que la solicitud no es demasiado antigua
    if (!verifyTimestamp(req.body)) {
      return false
    }

    return true
  } catch (error) {
    console.error("Error validating Alexa request:", error)
    return false
  }
}

// Verificar que la solicitud proviene de Alexa mediante la validación de la firma
function verifyAlexaRequest(req) {
  // En un entorno de producción, deberías implementar la verificación completa del certificado
  // Para simplificar, aquí solo verificamos que los encabezados necesarios estén presentes
  const signatureCertChainUrl = req.headers["signaturecertchainurl"]
  const signature = req.headers["signature"]

  if (!signatureCertChainUrl || !signature) {
    return false
  }

  // Verificar que la URL del certificado es de Amazon
  const certUrl = new URL(signatureCertChainUrl)
  if (
    certUrl.protocol !== "https:" ||
    !certUrl.hostname.endsWith("amazonaws.com") ||
    !certUrl.pathname.startsWith("/echo.api/")
  ) {
    return false
  }

  // En un entorno de producción, aquí deberías:
  // 1. Descargar el certificado de la URL
  // 2. Verificar la cadena de certificados
  // 3. Verificar que el certificado no está expirado
  // 4. Verificar la firma de la solicitud

  return true
}

// Verificar que el applicationId coincide con el configurado
function verifyApplicationId(body) {
  if (!body || !body.session || !body.session.application || !body.session.application.applicationId) {
    return false
  }

  const applicationId = body.session.application.applicationId
  return applicationId === process.env.ALEXA_APP_ID
}

// Verificar que la solicitud no es demasiado antigua
function verifyTimestamp(body) {
  if (!body || !body.request || !body.request.timestamp) {
    return false
  }

  const timestamp = new Date(body.request.timestamp).getTime()
  const now = new Date().getTime()

  return Math.abs(now - timestamp) < MAX_TIMESTAMP_DIFF_MS
}
