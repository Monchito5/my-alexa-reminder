const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "SessionEndedRequest"
  },
  handle(handlerInput) {
    console.log(`Sesión finalizada con motivo: ${handlerInput.requestEnvelope.request.reason}`)

    // No se puede enviar respuesta de voz en SessionEndedRequest
    return handlerInput.responseBuilder.getResponse()
  },
}

export default SessionEndedRequestHandler
