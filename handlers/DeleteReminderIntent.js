import * as db from "../services/db"

const DeleteReminderIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "DeleteReminderIntent"
    )
  },
  async handle(handlerInput) {
    const { slots } = handlerInput.requestEnvelope.request.intent
    const userId = handlerInput.requestEnvelope.session.user.userId

    // Verificar que el slot ReminderId esté presente
    if (!slots.ReminderId.value) {
      return handlerInput.responseBuilder
        .speak("Necesito el número del recordatorio que quieres eliminar. Por favor, intenta de nuevo.")
        .reprompt('¿Qué recordatorio quieres eliminar? Puedes decir "eliminar recordatorio uno".')
        .getResponse()
    }

    try {
      // Convertir el valor del slot a un número (índice)
      const reminderIndex = Number.parseInt(slots.ReminderId.value) - 1

      if (isNaN(reminderIndex) || reminderIndex < 0) {
        return handlerInput.responseBuilder
          .speak("Por favor, proporciona un número válido para el recordatorio que deseas eliminar.")
          .reprompt("¿Qué recordatorio quieres eliminar?")
          .getResponse()
      }

      // Obtener todos los recordatorios para encontrar el ID del que se va a eliminar
      const reminders = await db.list(userId)

      if (reminders.length === 0) {
        return handlerInput.responseBuilder.speak("No tienes recordatorios guardados para eliminar.").getResponse()
      }

      if (reminderIndex >= reminders.length) {
        return handlerInput.responseBuilder
          .speak(
            `Solo tienes ${reminders.length} recordatorios. Por favor, elige un número entre 1 y ${reminders.length}.`,
          )
          .reprompt("¿Qué recordatorio quieres eliminar?")
          .getResponse()
      }

      // Obtener el recordatorio a eliminar
      const reminderToDelete = reminders[reminderIndex]

      // Eliminar el recordatorio
      await db.remove(userId, reminderToDelete._id)

      const speechText = `He eliminado el recordatorio ${reminderIndex + 1} para ${reminderToDelete.medicine}.`

      return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard("Recordatorio Eliminado", speechText)
        .getResponse()
    } catch (error) {
      console.error("Error deleting reminder:", error)

      return handlerInput.responseBuilder
        .speak("Lo siento, ha ocurrido un error al eliminar el recordatorio. Por favor, intenta de nuevo.")
        .getResponse()
    }
  },
}

export default DeleteReminderIntentHandler
