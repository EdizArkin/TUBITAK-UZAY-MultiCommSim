package common;

import com.google.gson.Gson;


/**
 * JsonUtils provides utility methods to convert between
 * Java objects and their JSON string representations using Gson.
 * Includes:
 * fromJson: Parses a JSON string into a Java object of the specified class.
 * toJson: Serializes a Java object into a JSON string.
 * Used throughout the backend and client/server components for message encoding/decoding.
 */
public class JsonUtils {
    private static final Gson gson = new Gson();

    public static <T> T fromJson(String json, Class<T> clazz) {
        return gson.fromJson(json, clazz);
    }

    public static String toJson(Object obj) {
        return gson.toJson(obj);
    }
}
