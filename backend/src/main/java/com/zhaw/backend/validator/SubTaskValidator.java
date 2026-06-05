package com.zhaw.backend.validator;

public class SubTaskValidator {
    /**
     * Validates if the current position and the target position are close enough together.
     *
     * @param latitude          current location latitude in decimal degrees
     * @param longitude         current location longitude in decimal degrees
     * @param targetLatitude    target location latitude in decimal degrees
     * @param targetLongitude   target location longitude in decimal degrees
     * @param accuracyThreshold maximum allowed distance in meters
     * @return true if the distance is within the threshold
     */
    public static boolean validateGpsSubTask(Double latitude, Double longitude, Double targetLatitude, Double targetLongitude, double accuracyThreshold) {
        if (latitude == null || longitude == null || targetLatitude == null || targetLongitude == null) {
            return false;
        }
        double distance = calculateDistance(latitude, longitude, targetLatitude, targetLongitude);
        return distance <= accuracyThreshold;
    }

    /**
     * Calculates the distance between two GPS coordinates using the Haversine formula.
     *
     * @param lat1 latitude of the first point in decimal degrees
     * @param lon1 longitude of the first point in decimal degrees
     * @param lat2 latitude of the second point in decimal degrees
     * @param lon2 longitude of the second point in decimal degrees
     * @return distance in meters
     */
    private static double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371000; // Earth radius in meters
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
