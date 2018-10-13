//
// This script is attached to the stargate, and listens for user interaction.




/*********************************
 **          Polyfills          **
 *********************************/

/** function.bind() polyfill */
if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var aArgs   = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP    = function() {},
        fBound  = function() {
          return fToBind.apply(this instanceof fNOP
                 ? this
                 : oThis,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    if (this.prototype) {
      // Function.prototype doesn't have a prototype property
      fNOP.prototype = this.prototype;
    }
    fBound.prototype = new fNOP();

    return fBound;
  };
}














/**
 *  Stargate client class.
 *
 *  @class
 */
function Stargate() {

    // Bind event listeners
    this.onEnteredEntity = this.onEnteredEntity.bind(this)

}

/**
 *  Called by HF when the entity is loaded.
 */
Stargate.prototype.preload = function(id) {
    print("[Stargate] Loaded")

    // Store our ID
    this.id = id

    // Attach event listeners
    Entities.enterEntity.connect(this.onEnteredEntity)

}

/**
 *  Called by HF when the entity is unloaded.
 */
Stargate.prototype.unload = function(id) {
    print("[Stargate] Unloaded")

    // Remove event listeners
    Entities.enterEntity.disconnect(this.onEnteredEntity)

}

/**
 *  Utility function to get the child entity with a specific name
 */
Stargate.prototype.getChildWithName = function(name) {

    // Get all children
    var childrenIDs = Entities.getChildrenIDs(this.id)

    // Check each child
    for (var i = 0 ; i < childrenIDs.length ; i++) {

        // Get entity name
        var entityInfo = Entities.getEntityProperties(childrenIDs[i], ["name"])
        if (entityInfo.name == name)
            return childrenIDs[i]

    }

    // None found
    return null

}

/** @private Called when the user presses on the stargate */
Stargate.prototype.mousePressOnEntity = function(id, event) {

    // Ensure it's ours
    if (id != this.id)
        return

    // Ignore if it wasn't the primary button
    if (!event || !event.isPrimaryButton)
        return

    // Send event to server
    print("[Stargate] Sending toggle event to server...")
    Entities.callEntityServerMethod(this.id, "requestToggle", [])

}

/**
 *  Called by HF when the user goes inside our entity
 *
 *  @private
 */
Stargate.prototype.onEnteredEntity = function(id) {

    // Get entity of the collision area. Ideally we could have just used the main stargate entity, but enterEntity
    // seems to only get triggered for Zones. What a pity...
    var collisionEntity = this.getChildWithName('Stargate - Collision Zone')

    // Check ID
    if (id != collisionEntity)
        return

    // Find event horizon
    var horizon = this.getChildWithName("Stargate - Event Horizon")
    if (!horizon)
        return print('[Stargate] ERROR: Unable to find event horizon!')

    // Ensure it's visible
    var isVisible = Entities.getEntityProperties(horizon, ["visible"]).visible
    if (!isVisible)
        return print('[Stargate] User entered stargate, but the event horizon is not active. Ignoring.')

    // Get our destination
    var target = JSON.parse(Entities.getEntityProperties(this.id, ["userData"]).userData).stargateTarget
    if (!target)
        return print('[Stargate] Stargate has no target!')

    // Notify stargate server
    Entities.callEntityServerMethod(this.id, "userDidStepThrough", [])

    // Move the user soon
    print('[Stargate] Teleporting! Target = ' + target)
    Script.setTimeout(function() {
        location = target
    }, 100)

}

// Use this class as the entity controller
;(Stargate)
