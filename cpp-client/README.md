# Ingenuity C++ Client

Effortless. Powerful. Native.  
A C++ client library for the Together API, crafted for seamless integration with the Ingenuity platform.

## Why Ingenuity?

- **Blazing Fast**: Native C++ for unparalleled performance.  
- **Secure by Design**: API keys safely loaded from environment variables.  
- **Simple to Use**: Intuitive, class-based API.  
- **Modern**: Built with C++17 and robust libraries.  
- **Connected**: Powered by libcurl for reliable networking.


# Ingenuity C++ Client

Effortless. Powerful. Native.  
A C++ client library for the Together API, crafted for seamless integration with the Ingenuity platform.

## Why Ingenuity?

- **Blazing Fast**: Native C++ for unparalleled performance.  
- **Secure by Design**: API keys safely loaded from environment variables.  
- **Simple to Use**: Intuitive, class-based API.  
- **Modern**: Built with C++17 and robust libraries.  
- **Connected**: Powered by libcurl for reliable networking.

## What You Need

- **libcurl**: For HTTP requests.  
- **nlohmann/json**: For JSON parsing.  
- **CMake**: Version 3.10+ for builds.  
- **C++17**: Compatible compiler.

## Get Started

### Install Dependencies

**macOS (Homebrew)**  
```bash
brew install curl nlohmann-json cmake
```

**Ubuntu/Debian**  
```bash
sudo apt-get update
sudo apt-get install libcurl4-openssl-dev nlohmann-json3-dev cmake build-essential
```

**Windows (vcpkg)**  
```bash
vcpkg install curl nlohmann-json
```

### Build the Client

1. Clone and navigate:  
   ```bash
   cd cpp-client
   ```

2. Create build directory:  
   ```bash
   mkdir build && cd build
   ```

3. Configure with CMake:  
   ```bash
   cmake ..
   ```

4. Build:  
   ```bash
   make
   ```

### Configure Your API Key

In the project root, create a `.env` file:  
```env
TOGETHER_API_KEY=your_api_key_here
```

## Try It Out

```cpp
#include "together_api.h"

int main() {
    Together client;
    std::string response = client.createChatCompletion(
        "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
        "Explain quantum computing in simple terms"
    );
    std::cout << "Response: " << response << std::endl;
    return 0;
}
```

Run it:  
```bash
./together_api
```

## API at a Glance

### `Together` Class

**Constructor**  
```cpp
Together()
```
Loads the API key from `.env`.

**Key Method**  
```cpp
std::string createChatCompletion(const std::string& model, const std::string& userMessage)
```
- **model**: e.g., "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free"  
- **userMessage**: Your input prompt  
- **Returns**: The AI’s response as a string

## Supported Models

- `deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free`  
- `Qwen/Qwen2.5-Coder-32B-Instruct`  
- And more Together API models.

## Built-In Resilience

Handles errors gracefully:  
- Network issues  
- JSON parsing failures  
- Authentication errors  
- Missing environment variables  

## Powering Ingenuity

Use this client for:  
- High-performance batch processing  
- Native desktop apps  
- Server-side integrations  
- Performance-critical workflows  

## Join the Journey

1. Fork the repo.  
2. Create a feature branch.  
3. Code, test, and refine.  
4. Submit a pull request.  

## License

MIT License. See the main project LICENSE file.

## Need Help?

- Open a GitHub issue.  
- Explore Ingenuity documentation.  
- Visit the Together API docs.