cmake_minimum_required(VERSION 3.10)
project(Ingenuity_CPP_Client VERSION 1.0.0 LANGUAGES CXX)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Set build type if not specified
if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Release)
endif()

# Find required packages
find_package(CURL REQUIRED)
find_package(nlohmann_json 3.2.0 REQUIRED)

# Source files
set(SOURCES
    together_api.cpp
    together_api.h
)

# Add executable
add_executable(together_api ${SOURCES})

# Set target properties
set_target_properties(together_api PROPERTIES
    OUTPUT_NAME "ingenuity_cpp_client"
    CXX_STANDARD 17
    CXX_STANDARD_REQUIRED ON
)

# Include directories
target_include_directories(together_api PRIVATE ${CMAKE_CURRENT_SOURCE_DIR})

# Link libraries
target_link_libraries(together_api PRIVATE
    CURL::libcurl
    nlohmann_json::nlohmann_json
)

# Compiler-specific options
if(MSVC)
    target_compile_options(together_api PRIVATE /W4)
else()
    target_compile_options(together_api PRIVATE -Wall -Wextra -Wpedantic)
endif()

# Installation rules
install(TARGETS together_api
    RUNTIME DESTINATION bin
)

install(FILES together_api.h
    DESTINATION include
)
