export default function EventDispatcher() {
  return ((eventType, object, index) => {
    const eventDispatcher = new events.EventEmitter()
    eventDispatcher.emit({ eventType, object, index, value})
  })
}