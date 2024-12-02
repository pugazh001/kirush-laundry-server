[5:03 PM, 9/27/2024] Aishwarya Akka Office: class add_products {
  final String baseUrl = 'http://136.185.14.8:8099/api/serviceSubTypes';

  // Function to create a service by making a POST request
  Future<http.Response> add_productfunc(add_product _add_product) async {
    final url = Uri.parse(baseUrl);

    // Prepare headers for the request
    final headers = {
      'Content-Type': 'application/json',
    };

    // Convert the Service object to a JSON format string
    final body = jsonEncode(_add_product.toJson());

    try {
      // Send POST request
      final response = await http.post(
        url,
        headers: headers,
        body: body,
      );

      // Check if the response status is OK
      if (response.statusCode == 201) {
        // Successfully created the service
        return response;
      } else {
        // Handle the error
        throw Exception('Failed to create service: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Failed to create service: $e');
    }
  }
}
[5:04 PM, 9/27/2024] Aishwarya Akka Office: 