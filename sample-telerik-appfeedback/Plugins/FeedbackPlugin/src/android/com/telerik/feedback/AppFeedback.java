package com.telerik.feedback;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;
import org.json.JSONArray;
import org.json.JSONException;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.provider.Settings;

import com.telerik.widget.feedback.RadFeedback;

public class AppFeedback extends CordovaPlugin implements RadFeedback.OnSendFeedbackFinishedListener {
    private CallbackContext lastCallbackContext;
    private RadFeedback radFeedback;
    private boolean shouldShowFeedback;

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        switch (action.toLowerCase()) {
            case "initialize":
                this.initialize(args, callbackContext);
            break;
            case "showfeedback":
                this.showFeedback();
            break;
        default: 
            return false;
        }

        return true;
    }

    @Override
    public void sendFeedbackFinished() {
        this.shouldShowFeedback = true;
        this.lastCallbackContext.success();
    }

    private void initialize(JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (this.radFeedback == null) {
            String apiKey = args.getString(0);
            String apiBaseUrl = args.getString(1);

            String uid = Settings.Secure.getString(this.cordova.getActivity().getContentResolver(), android.provider.Settings.Secure.ANDROID_ID);

            this.lastCallbackContext = callbackContext;
            this.radFeedback = RadFeedback.instance();
            this.shouldShowFeedback = true;

            this.radFeedback.init(apiKey, apiBaseUrl, uid);
            this.radFeedback.setOnFeedbackFinishedListener(this);

            //activate shake detection 
            this.mSensorManager = (SensorManager) this.cordova.getActivity().getSystemService(Context.SENSOR_SERVICE);
            this.mSensorManager.registerListener(mSensorListener, mSensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER), SensorManager.SENSOR_DELAY_NORMAL);
            this.mAccel = 0.00f;
            this.mAccelCurrent = SensorManager.GRAVITY_EARTH;
            this.mAccelLast = SensorManager.GRAVITY_EARTH;
        }
    }
    
    private void showFeedback() {
        if (this.radFeedback != null) {
            this.shouldShowFeedback = false;
            this.radFeedback.show(this.cordova.getActivity());
        }
    }

    private void shakeDetected() {
        this.showFeedback();
    }

    /*
     * Shake detection - used http://stackoverflow.com/questions/2317428/android-i-want-to-shake-it with modifications:
     * Overriden CordovaPlugin onResume/pause, instead of Activity
     * Initialization happens in execute(String, JSONArray, CallbackContext), instead of onCreate().
     */

    private SensorManager mSensorManager;
    private float mAccel; // acceleration apart from gravity
    private float mAccelCurrent; // current acceleration including gravity
    private float mAccelLast; // last acceleration including gravity

    private final SensorEventListener mSensorListener = new SensorEventListener() {
        public void onSensorChanged(SensorEvent se) {
            float x = se.values[0];
            float y = se.values[1];
            float z = se.values[2];

            mAccelLast = mAccelCurrent;
            mAccelCurrent = (float) Math.sqrt((double) (x * x + y * y + z * z));
            float delta = mAccelCurrent - mAccelLast;
            mAccel = mAccel * 0.9f + delta; // perform low-cut filter

            if (mAccel > 10 && AppFeedback.this.shouldShowFeedback) {                
                AppFeedback.this.shakeDetected();
            }
        }

        public void onAccuracyChanged(Sensor sensor, int accuracy) {
        }
    };

    @Override
    public void onResume(boolean multitasking) {
        super.onResume(multitasking);
        if (this.mSensorManager != null) {
            this.mSensorManager.registerListener(this.mSensorListener,
                    this.mSensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER),
                    SensorManager.SENSOR_DELAY_NORMAL);
        }
    }

    @Override
    public void onPause(boolean multitasking) {
        if (this.mSensorManager != null){
            this.mSensorManager.unregisterListener(this.mSensorListener);
        }
        super.onPause(multitasking);
    }
}