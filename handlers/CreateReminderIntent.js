import * as db from "../services/db"

const CreateReminderIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "CreateReminderIntent"
    )
  },
  async handle(handlerInput) {
    const { slots } = handlerInput.requestEnvelope.request.intent
    const userId = handlerInput.requestEnvelope.session.user.userId

    // Verificar que todos los slots necesarios estén presentes
    if (!slots.MedicineName.value || !slots.Dosage.value || !slots.Time.value) {
      return handlerInput.responseBuilder
        .speak(
          "Necesito el nombre del medicamento, la dosis y la hora para crear un recordatorio. Por favor, intenta de nuevo.",
        )
        .reprompt("Dime el nombre del medicamento, la dosis y la hora para el recordatorio.")
        .getResponse()
    }

    try {
      // Guardar el recordatorio en la base de datos
      await db.create({
        userId: userId,
        medicine: slots.MedicineName.value,
        dosage: slots.Dosage.value,
        time: slots.Time.value,
        createdAt: new Date().toISOString(),
      })

      const speechText = `He creado un recordatorio para tomar ${slots.MedicineName.value} con una dosis de ${slots.Dosage.value} a las ${slots.Time.value}.`

      return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard("Recordatorio Creado", speechText)
        .getResponse()
    } catch (error) {
      console.error("Error creating reminder:", error)

      return handlerInput.responseBuilder
        .speak("Lo siento, ha ocurrido un error al crear el recordatorio. Por favor, intenta de nuevo.")
        .getResponse()
    }
  },
}

export default CreateReminderIntentHandler
