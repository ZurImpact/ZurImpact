package com.zhaw.backend.validator;

public class SubActionValidator {
    /**
     * validates if the current position and the targetPosition are close enought together
     * @param gpsX current Location latitude
     * @param gpsY current Location longitude
     * @param targetX target Location latitude
     * @param targetY target Location longitude
     * @param accuracyThreshold the maximum allowed distance between the current position and the target position for the validation to pass, in the same units as the input coordinates
     * @return
     */
    public static boolean validateGpsSubAction(Float gpsX, Float gpsY, Float targetX, Float targetY, float accuracyThreshold) {
            if (gpsX == null || gpsY == null || targetX == null || targetY == null) {
                return false; // Invalid input
            }
            double distance = calculateDistance(gpsX, gpsY, targetX, targetY);
            return distance <= accuracyThreshold;
        }

        /**
        calculates the distance between two GPS coordinates using the Euclidean distance formula.
         * @param x1 the x-coordinate (latitude) of the first point
         * @param y1 the y-coordinate (longitude) of the first point
         * @param x2 the x-coordinate (latitude) of the second point
         * @param y2 the y-coordinate (longitude) of the second point
         * @return the distance between the two points in the same units as the input coordinates
         * */
        private static double calculateDistance(float x1, float y1, float x2, float y2) {
            double dx = x2 - x1;
            double dy = y2 - y1;
            return Math.sqrt(dx * dx + dy * dy);
        }
}
