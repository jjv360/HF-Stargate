//
// This script is attached to the stargate server-side, and controls gate activation.

/** Maximum amount of time a stargate can stay open */
var MAX_STARGATE_ACTIVATION_DURATION = 1000 * 60 * 38

/**
 *  Stargate server class.
 *
 *  @class
 */
function StargateServer() {

    // True if the gate is currently open.
    this.isActive = false

    // When the gate is open, this timer closes it after the maximum duration.
    this.shutdownTimer = null

    // Functions callable from other entities
    this.remotelyCallable = ["requestToggle", "userDidStepThrough"]

    // Contains the audio injector which plays the puddle loop sound while activated
    this.puddleAudio = null

}

/**
 *  Called by HF when the entity is loaded.
 */
StargateServer.prototype.preload = function(id) {
    print("[StargateServer] Loaded")

    // Store our ID
    this.id = id

    // Load sounds
    this.sounds = {}
    this.sounds["activate"] = SoundCache.getSound(Script.resolvePath("activate.mp3"))
    this.sounds["puddle_loop"] = SoundCache.getSound(Script.resolvePath("puddle_loop.mp3"))
    this.sounds["shutdown"] = SoundCache.getSound(Script.resolvePath("shutdown.mp3"))
    this.sounds["step_through1"] = SoundCache.getSound(Script.resolvePath("step_through1.mp3"))
    this.sounds["step_through2"] = SoundCache.getSound(Script.resolvePath("step_through2.mp3"))

}

/**
 *  Called by HF when the entity is removed.
 */
StargateServer.prototype.unload = function(id) {
    print("[StargateServer] Unloaded")

    // Stop the puddle audio, if any
    if (this.puddleAudio)
        this.puddleAudio.stop()

}

/**
 *  Called remotely when a user wants to toggle the gate
 */
StargateServer.prototype.requestToggle = function() {

    // Prevent changing state too quickly
    if (this._freezeState) return
    this._freezeState = true
    var _this = this
    Script.setTimeout(function() {
        _this._freezeState = false
    }, 4000)

    // Check if the gate is open
    if (this.isActive)
        this.deactivate()
    else
        this.activate()

}

/** Activates the gate */
StargateServer.prototype.activate = function() {

    // Mark active
    if (this.isActive) return
    this.isActive = true

    // Remove all children. This is just in case, since they should have all been removed already at this point.
    var ids = Entities.getChildrenIDs(this.id)
    for (var i = 0 ; i < ids.length ; i++)
        Entities.deleteEntity(ids[i])

    // Create event horizon
    var horizon = Entities.addEntity({
        collisionless: true,
        dimensions: { x: 0.3, y: 10, z: 10 },
        name: "Stargate - Event Horizon",
        parentID: this.id,
        localPosition: { x: 0, y: 0, z: 0 },
        localRotation: { w: 1, x: 0, y: 0, z: 0 },
        type: 'Sphere',
        userData: JSON.stringify({
            grabbableKey: { grabbable: false },
            ProceduralEntity:{
                version: 2,
                shaderUrl: Script.resolvePath("event-horizon.fs")
            }
        })
    })

    // Create collision zone
    var collisionZone = Entities.addEntity({
        dimensions: { x: 0.8, y: 11, z: 11 },
        name: "Stargate - Collision Zone",
        parentID: this.id,
        localPosition: { x: 0, y: 0, z: 0 },
        localRotation: { w: 1, x: 0, y: 0, z: 0 },
        type: 'Zone',
        shapeType: 'box',
        userData: JSON.stringify({
            grabbableKey: { grabbable: false }
        })
    })

    // Play activation sound
    this.playSound('activate')

    // Wait a bit
    var _this = this
    Script.setTimeout(function() {

        // Play puddle loop sound
        _this.puddleAudio = _this.playSound('puddle_loop', { loop: true })

    }, 500)

    // Start the deactivation timer
    if (this.shutdownTimer) Script.clearTimeout(this.shutdownTimer)
    this.shutdownTimer = Script.setTimeout(function() {
        _this.deactivate()
        _this.shutdownTimer = null
    }, MAX_STARGATE_ACTIVATION_DURATION)

}

/** Deactivates the gate */
StargateServer.prototype.deactivate = function() {

    // Mark active
    if (!this.isActive) return
    this.isActive = false

    // Clear the deactivation timer
    if (this.shutdownTimer) Script.clearTimeout(this.shutdownTimer)
    this.shutdownTimer = null

    // Play the shutdown sound
    this.playSound('shutdown')

    // Stop the puddle audio soon
    var _this = this
    Script.setTimeout(function() {
        if (_this.puddleAudio) _this.puddleAudio.stop()
        _this.puddleAudio = null
    }, 250)

    // Remove all children soon
    Script.setTimeout(function() {

        var ids = Entities.getChildrenIDs(_this.id)
        for (var i = 0 ; i < ids.length ; i++)
            Entities.deleteEntity(ids[i])

    }, 2000)

}

/** Plays a named sound, returns the `AudioInjector`. */
StargateServer.prototype.playSound = function(name, options) {

    // Check if sound exists
    if (!this.sounds[name])
        return print("[StargateServer] Sound " + name + " doesn't exist!")

    // Check if loaded
    if (!this.sounds[name].downloaded)
        return print("[StargateServer] Can't play sound " + name + ", not loaded.")

    // Get our position
    var position = Entities.getEntityProperties(this.id, ["position"]).position

    // Set default options
    if (!options) options = {}
    if (typeof options.position == "undefined")
        options.position = position

    // Play it
    return Audio.playSound(this.sounds[name], options)

}

/** Called by the client to notify us when a user steps through the stargate */
StargateServer.prototype.userDidStepThrough = function() {

    // Pick sound
    var soundName = Math.random() < 0.5 ? 'step_through1' : 'step_through2'

    // Play sound
    this.playSound(soundName)

}


// Use this class as the entity controller
;(StargateServer)
