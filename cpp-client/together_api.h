#ifndef TOGETHER_API_H
#define TOGETHER_API_H

#include <iostream>
#include <string>
#include <fstream>
#include <sstream>
#include <curl/curl.h>
#include <nlohmann/json.hpp>
#include <unordered_map>

using json = nlohmann::json;

/**
 * @brief Load environment variables from a .env file
 * @param filePath Path to the .env file (default: ".env")
 * @return Unordered map containing key-value pairs from the .env file
 */
std::unordered_map<std::string, std::string> loadEnvFile(const std::string& filePath = ".env");

/**
 * @brief Callback function for libcurl to write response data
 * @param contents Pointer to the data received
 * @param size Size of each data element
 * @param nmemb Number of data elements
 * @param s Pointer to the string where data will be stored
 * @return Number of bytes processed
 */
static size_t WriteCallback(void* contents, size_t size, size_t nmemb, std::string* s);

/**
 * @brief Together API client class for interacting with Together AI services
 */
class Together {
private:
    std::unordered_map<std::string, std::string> envVars;
    std::string apiKey;

public:
    /**
     * @brief Constructor - initializes curl and loads API key from environment
     */
    Together();

    /**
     * @brief Destructor - cleans up curl resources
     */
    ~Together();

    /**
     * @brief Create a chat completion using the Together API
     * @param model The model to use for completion (e.g., "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free")
     * @param userMessage The user's input message
     * @return The AI's response as a string, or empty string on error
     */
    std::string createChatCompletion(const std::string& model, const std::string& userMessage);
};

#endif // TOGETHER_API_H
