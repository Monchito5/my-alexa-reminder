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
  // En un entorno de producción, verificamos que los encabezados necesarios estén presentes
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

  // Verificar la cadena de certificados
  const rootCert = fs.readFileSync(path.resolve(__dirname, "AmazonRootCA1.pem"))
  const cert = fs.readFileSync(signatureCertChainUrl)
  const chain = [cert]
  const verifyOptions = {
    issuer: rootCert,
    algorithm: "sha256WithRSAEncryption",
  }
  try {
    const verifiedChain = crypto.verifyChain(chain, verifyOptions)
    if (!verifiedChain) {
      return false
    }
  } catch (error) {
    console.error("Error verifying certificate chain:", error)
    return false
  }

  // Verificar que el certificado no está expirado
  const certInfo = crypto.getCertificateInfo(cert)
  const now = new Date()
  if (certInfo.notBefore > now || certInfo.notAfter < now) {
    return false
  }

  // Verificar la firma de la solicitud
  const body = JSON.stringify(req.body)
  const hash = crypto.createHash("sha256")
  hash.update(body)
  const hashString = hash.digest("hex")
  const signatureBuffer = Buffer.from(signature, "base64")
  const verified = crypto.verify(hashString, signatureBuffer, cert)
  if (!verified) {
    return false
  }

  // Verificar que el hash de la solicitud coincide con el hash del body de la solicitud
  const requestHash = req.headers["x-amz-checksum"]
  if (requestHash !== hashString) {
    return false
  }

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
