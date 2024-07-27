### Project Documentation

## 1. Text completion :
For text completion streaming in this app we use an API that provide a completion endpoint with this usage structure:

```python
curl http://localhost:1234/v1/chat/completions \
-H "Content-Type: application/json" \
-d '{ 
        "model": "bartowski/gemma-2-9b-it-GGUF",
        "messages": [ 
        { "role": "system", "content": "Always answer in rhymes." },
        { "role": "user", "content": "Introduce yourself." }
        ], 
        "temperature": 0.7, 
        "max_tokens": -1,
        "stream": true
    }'
```

If you use another api structure feel freeto change it here: `src\GaistAI\index.tsx` on `runInference` function.

## 2. Function execution : 
Our function execution capabilities are driven by context instructions to the text generative model. 

You can find the instructions in the `runInference` function located in `src/GaistAI/index.tsx`.

When the model returns an answer, we extract function parameters using the `handleFunctionCallString` function in `src/GaistAI/utils/utils.ts`. This function parses the function JSON object from the LLM's answer.

Once successfully extracted, the `handleFunctionCall` function is called in the same file. This function routes to the appropriate implementation based on the extracted metadata.

Actually three of them are implemented : 
All file parameter in the following function can be of type File or url as string. There is a sanitizer that ebnsure that the value parsed to the endpoint will be file budffer. 
1. For image style transfert : 
* Function Name : `apply_style_transfer`
* Parameters : 
    * `styleImagePath`- The file where the style is extracted.
    * `contentImagePath` - The file to which the style is applied.
    
    ```javascript 
    const formData = new FormData();
    formData.append('content_image', contentImagePath);
    formData.append('style_image', styleImagePath);
    const response = await axios.post(`
        ${IMAGE_PROCESSING_ENDPOINT}/style-transfer`, 
        formData, 
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            responseType: 'blob',
        }
    );

    // Create a URL for the image blob
    const url = URL.createObjectURL(response.data);
    ```

    This endpoint receives two file buffers and returns a file as output.


2. Image Upscaling : using vgg9
* Function Name : `enhance_resolution`
* Parameters : 
    * `image_path` - The file to upscale.
    * `target_width` - The desired width.
    * `target_height`- The desired height.
    
    ```javascript 
    const formData = new FormData();
    formData.append('file', image_path);
    const response = await axios.post(`${IMAGE_PROCESSING_ENDPOINT}/upscale`, 
        formData, 
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            responseType: 'blob',
        }
    );

    // Create a URL for the image blob
    const url = URL.createObjectURL(response.data);
    ```

    This endpoint receives a file buffer and returns a file as output.

2.  Image Generation : Actually usinf sdxl
* Function Name:  `generate_image_from_text`
* params : 
    * description - The prompt to send to the generative model.

    ```javascript 
    const response = await axios.post(`
        ${IMAGE_PROCESSING_ENDPOINT}/sdxl/text2img`, 
        {
            "prompt": description,
            "steps": 5
        },
        {
            responseType: 'blob',
        }
    );
    const url = URL.createObjectURL(response.data);
    ```

    This endpoint receives a prompt and returns a file as output.


## 3. API Implementation:

We are currently working to make the API implementation available on this GitHub account. Stay tuned for updates! 😊