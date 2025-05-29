#include "together_api.h"

// Function to load environment variables from .env file
std::unordered_map<std::string, std::string> loadEnvFile(const std::string& filePath) {
    std::unordered_map<std::string, std::string> envVars;
    std::ifstream envFile(filePath);

    if (envFile.is_open()) {
        std::string line;
        while (std::getline(envFile, line)) {
            // Skip empty lines and comments
            if (line.empty() || line[0] == '#') {
                continue;
            }

            // Find the equals sign
            size_t pos = line.find('=');
            if (pos != std::string::npos) {
                std::string key = line.substr(0, pos);
                std::string value = line.substr(pos + 1);

                // Remove any trailing whitespace from key
                key.erase(key.find_last_not_of(" \t") + 1);
                // Remove any leading whitespace from value
                value.erase(0, value.find_first_not_of(" \t"));

                envVars[key] = value;
            }
        }
        envFile.close();
    } else {
        std::cerr << "Warning: Could not open .env file at " << filePath << std::endl;
    }

    return envVars;
}

// Callback function to write response data from curl
static size_t WriteCallback(void* contents, size_t size, size_t nmemb, std::string* s) {
    size_t newLength = size * nmemb;
    try {
        s->append((char*)contents, newLength);
        return newLength;
    } catch(std::bad_alloc& e) {
        // Handle memory problem
        return 0;
    }
}

Together::Together() {
        // Initialize curl once per program
        curl_global_init(CURL_GLOBAL_ALL);

        // Load environment variables (look in project root directory)
        envVars = loadEnvFile("../../.env");

        // Get API key from environment variables
        if (envVars.find("TOGETHER_API_KEY") != envVars.end()) {
            apiKey = envVars["TOGETHER_API_KEY"];
        } else {
            std::cerr << "Warning: TOGETHER_API_KEY not found in .env file" << std::endl;
            apiKey = "YOUR_API_KEY"; // Fallback
        }
}

Together::~Together() {
        // Clean up curl
        curl_global_cleanup();
}

std::string Together::createChatCompletion(const std::string& model, const std::string& userMessage) {
        CURL* curl = curl_easy_init();
        std::string readBuffer;

        if(curl) {
            // Set API endpoint
            curl_easy_setopt(curl, CURLOPT_URL, "https://api.together.xyz/v1/chat/completions");

            // Set headers
            struct curl_slist* headers = NULL;
            headers = curl_slist_append(headers, "Content-Type: application/json");

            // Add API key from .env file
            std::string authHeader = "Authorization: Bearer " + apiKey;
            headers = curl_slist_append(headers, authHeader.c_str());
            curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);

            // Create JSON payload
            json payload = {
                {"model", model},
                {"messages", json::array({
                    {{"role", "user"}, {"content", userMessage}}
                })}
            };

            std::string jsonStr = payload.dump();

            // Set request body
            curl_easy_setopt(curl, CURLOPT_POSTFIELDS, jsonStr.c_str());

            // Set write function callback
            curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
            curl_easy_setopt(curl, CURLOPT_WRITEDATA, &readBuffer);

            // Perform the request
            CURLcode res = curl_easy_perform(curl);

            // Check for errors
            if(res != CURLE_OK) {
                std::cerr << "curl_easy_perform() failed: " << curl_easy_strerror(res) << std::endl;
                return "";
            }

            // Clean up
            curl_slist_free_all(headers);
            curl_easy_cleanup(curl);

            // Parse the JSON response
            try {
                json response = json::parse(readBuffer);

                // Check if the response has the expected structure
                if (response.contains("choices") && response["choices"].is_array() &&
                    !response["choices"].empty() && response["choices"][0].contains("message") &&
                    response["choices"][0]["message"].contains("content")) {
                    return response["choices"][0]["message"]["content"];
                } else if (response.contains("error")) {
                    std::cerr << "API Error: " << response["error"]["message"] << std::endl;
                    return "";
                } else {
                    std::cerr << "Unexpected response format: " << response.dump(2) << std::endl;
                    return "";
                }
            } catch (json::parse_error& e) {
                std::cerr << "JSON parse error: " << e.what() << std::endl;
                std::cerr << "Raw response: " << readBuffer << std::endl;
                return "";
            } catch (json::type_error& e) {
                std::cerr << "JSON type error: " << e.what() << std::endl;
                std::cerr << "Raw response: " << readBuffer << std::endl;
                return "";
            }
        }

        return "";
}

int main() {
    // Create Together client (this will load API key from .env file)
    Together client;

    std::cout << "Sending request to Together API..." << std::endl;

    std::string response = client.createChatCompletion(
        "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
        "What are some fun things to do in New York?"
    );

    std::cout << "\nResponse from API:\n" << response << std::endl;

    return 0;
}
