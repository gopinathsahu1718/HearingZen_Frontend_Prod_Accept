package com.hearingzen

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class StepCounterModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), SensorEventListener {

    private var sensorManager: SensorManager? = null
    private var stepCounter: Sensor? = null

    override fun getName(): String = "StepCounter"

    override fun initialize() {
        super.initialize()

        sensorManager = reactContext.getSystemService(Context.SENSOR_SERVICE) as SensorManager
        stepCounter = sensorManager?.getDefaultSensor(Sensor.TYPE_STEP_COUNTER)

        stepCounter?.let {
            sensorManager?.registerListener(this, it, SensorManager.SENSOR_DELAY_NORMAL)
        }
    }

    override fun onSensorChanged(event: SensorEvent?) {
        event?.let {
            val steps = it.values[0]
            sendEvent("StepCounterUpdate", steps)
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

    private fun sendEvent(event: String, value: Any) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(event, value)
    }

    // REQUIRED FOR REACT-NATIVE EVENT EMITTER
    @ReactMethod
    fun addListener(eventName: String?) {
        // Required but no action needed
    }

    @ReactMethod
    fun removeListeners(count: Int?) {
        // Required but no action needed
    }
}
