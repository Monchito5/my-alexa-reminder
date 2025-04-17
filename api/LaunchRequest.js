const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "LaunchRequest"
  },
  handle(handlerInput) {
    const speechText =
      'Bienvenido a Recordatorios de Medicamentos. Puedes crear un recordatorio diciendo "crear recordatorio", listar tus recordatorios diciendo "listar recordatorios", o eliminar un recordatorio específico.'

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt("¿Qué te gustaría hacer? Puedes crear, listar o eliminar recordatorios.")
      .withSimpleCard("Recordatorios de Medicamentos", speechText)
      .getResponse()
  },
}

export default LaunchRequestHandler
