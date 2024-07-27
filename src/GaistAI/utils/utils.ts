import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import { MessageFile } from "../components/gaist-ai-comp";
import { IMAGE_PROCESSING_ENDPOINT } from "@/constants";

async function filesanitizer(file?: File | string | null) {
    if(file){
        if(typeof file == "string" && file?.startsWith("blob:http")){
            const response = await fetch(file);
            const blob = await response.blob();
            const mimeType = blob.type || 'application/octet-stream'; // Fallback MIME type
            return new File([blob], `file_${uuidv4()}`, { type: mimeType});
        }else if(typeof file == "object"){
            return file
        }
    }
    return null
}

export async function handleFunctionCallString(inputString:string,files:MessageFile[] | null=null,callback:(e?:any)=>void) {
    // Extract the JSON part of the string
    // Clean and format the string to JSON
    var cleanedInput = inputString?.split("\n")?.join(' ')?.toString()
    // console.log("Run function step 0",cleanedInput)
    var jsonObject = null
    var jsonString = null
    var additionalMessage = null;
    if(cleanedInput?.startsWith("```json")){
        jsonObject = cleanedInput.match(/```json\s*({[\s\S]*?})\s*```(.*)/s);
        // console.log("Run function step 1",jsonObject)
        if(jsonObject){
            jsonString = jsonObject[1]
            additionalMessage = jsonObject[2]?.trim();
            // console.log("Run function step 2",jsonString,additionalMessage)
        }
    }
    if(cleanedInput?.startsWith("{")){
        jsonObject = cleanedInput.match(/{(?:[^{}]|(\{(?:[^{}]|\{[^{}]*\})*\}))*}/);
        // console.log("Run function step 1",jsonObject)
        if(jsonObject){
            jsonString = jsonObject[0]
            additionalMessage = jsonObject[1]?.trim();
            // console.log("Run function step 2",jsonString,additionalMessage)
        }
    }
  
  
    if(jsonString){
        try{
            const functionObject = JSON.parse(jsonString) as {
                call_function : {
                    name : string,
                    params : {
                        name: string,
                        value: any
                    }[]
                },
                extra_message: string
            }
            // console.log("Run function step 3",functionObject)
            var callbackData = await handleFunctionCall(functionObject?.call_function?.name,functionObject?.call_function?.params,files,[functionObject?.extra_message,additionalMessage]?.filter(e=>e)?.join('. '))
            callback(callbackData)
            return
        }catch(e:any){
            // console.log("Run function step -1",e)
        }
        callback( {
            content: 'Oops! Our function executor miss the point 🙇‍♂️',
            actions : []
        })
    }
   
    // console.log("json","FAILED")
    callback( {
        content: 'Oops! Our function executor miss the point 🙇‍♂️',
        actions : []
    })

}

// Example function to handle function calls
async function handleFunctionCall(name: string, params: any[],files:MessageFile[] | null, additionalMessage = '') {
    console.log("files",files)
    switch (name) {
        case "resize_image":
            // Extract parameters
            const resizeImagePath = params.find(param => param.name === "image_path")?.value;
            const resizeWidth = params.find(param => param.name === "width")?.value;
            const resizeHeight = params.find(param => param.name === "height")?.value;
            // Call the function
            console.log("call resize function", resizeImagePath, resizeWidth, resizeHeight, additionalMessage);
            return {

            }

        case "apply_style_transfer":
            const contentImagePath = params.find(param => param.name === "content_image_path")?.value;
            const styleImagePath = params.find(param => param.name === "style_image_path")?.value;
            var contentImageFile = await filesanitizer(
                files ? (files.find((f)=>{return f?.id == contentImagePath})?.file ||null) : null
            )
            var styleImageFile = await filesanitizer(
                files ? (files.find((f)=>{return f?.id == styleImagePath})?.file ||null) : null
            )
            const styl_trans_messages: string[] = [
                "Your image style transfer is complete! Check out the transformed image.",
                "Great news! The style transfer process is finished. Enjoy your new image!",
                "Your image has been successfully styled. View the transformed result here!",
                "Success! Your image now reflects the new style. Click to see the transformation.",
                "All done! The style transfer is complete. Take a look at your updated image.",
                "Your image styling request is complete. Here is the transformed version!",
                "Hooray! Your image has been successfully styled. Check out the new look!",
                "Image style transfer successful! Here is the result of your request.",
                "Your image has been transformed with the new style. View the result!",
                "The style transfer process is complete. See how your image has been transformed!"
            ];
            try{
                if(!contentImageFile || !styleImageFile){
                    return {
                        content: 'Oops! Please provide the two images files to work with.',
                        actions : []
                    }
                }
                var finalFile = await apply_style_transfer(
                    contentImageFile, 
                    styleImageFile
                )
                if(finalFile?.success){

                    return {
                        content: getRandomMessage(styl_trans_messages),
                        actions : [
                            {
                                type: "image",
                                ar : '1/1',
                                file : {
                                    type : "image",
                                    content : finalFile?.url
                                }
                            }
                        ]
                    }
                }else{
                    return {
                        content: finalFile?.message,
                        actions : []
                    }
                }
            }catch(e){
               
                
                return {
                    content: 'Oops! Unable to perform this action for now. '+additionalMessage,
                    actions : []
                }
            }
           

        case "enhance_resolution":
            const enhanceImagePath = params.find(param => param.name === "image_path")?.value;
            var enhanceImagePathFile = await filesanitizer(
                files ? (files.find((f)=>{return f?.id == enhanceImagePath})?.file ||null) : null
            )
            if(!enhanceImagePathFile){
                return {
                    content: 'Oops! Something went wrong with these images',
                    actions : []
                }
            }
            const targetWidth = params.find(param => param.name === "target_width")?.value;
            const targetHeight = params.find(param => param.name === "target_height")?.value;
            var finalFile = await enhance_resolution(enhanceImagePathFile, targetWidth, targetHeight);
            const res_messages: string[] = [
                "Your image has been successfully resized! Check out the new resolution.",
                "Great news! Your image has been adjusted to the desired resolution.",
                "The image resolution change you requested is complete. Enjoy the new size!",
                "Your image has been resized as requested. View the updated resolution here!",
                "Success! Your image has been adjusted. Click to see the new resolution.",
                "All done! Your image resolution has been modified and is ready for you.",
                "Your image resizing request is complete. Here is the new resolution!",
                "Hooray! Your image has been successfully resized. Take a look at the updated version!",
                "Image resizing successful! Here is the result of your request.",
                "Your image has been resized. Check out the new resolution and let us know what you think!"
            ];
            if(finalFile?.success){

                return {
                    content: getRandomMessage(res_messages),
                    actions : [
                        {
                            type: "image",
                            ar : '1/1',
                            file : {
                                type : "image",
                                ar : '1/1',
                                content : finalFile?.url
                            }
                        }
                    ]
                }
            }else{
                return {
                    content: finalFile?.message,
                    actions : []
                }
            }

        case "generate_image_from_text":
            const messages: string[] = [
                "Your image has been successfully generated! Check it out!",
                "Great news! Your image is ready and available for download.",
                "The image you requested has been created. Enjoy!",
                "Your generated image is now complete. View it here!",
                "Success! Your image has been generated. Check bellow.",
                "All done! Your image is ready and waiting for you.",
                "Your image generation request is complete. Here is your image!",
                "Hooray! Your image has been successfully generated. Take a look!",
                "Image generation successful! Here is the result of your request.",
                "Your image has been created. Check it out and let us know what you think!"
            ];
            
            const description = params.find(param => param.name === "description")?.value;
            var finalFile = await generate_image_from_text(description);
            if(finalFile?.success){

                return {
                    content: getRandomMessage(messages),
                    actions : [
                        {
                            type : "image",
                            ar : '1/1',
                            file : {
                                ar : '1/1',
                                content : finalFile?.url
                            }
                        }
                    ]
                }
            }else{
                return {
                    content: finalFile?.message,
                    actions : []
                }
            }
    

        case "generate_design":
            const inputParams = params.find(param => param.name === "input_params")?.value;
            await generate_design(inputParams);
            return {
                
            }

        case "fill_missing_parts":
            const fillImagePath = params.find(param => param.name === "image_path")?.value;
            const maskPath = params.find(param => param.name === "mask_path")?.value;
            await fill_missing_parts(fillImagePath, maskPath);
            return {
                
            }


        case "synthesize_texture":
            const sampleImagePath = params.find(param => param.name === "sample_image_path")?.value;
            const outputWidth = params.find(param => param.name === "output_width")?.value;
            const outputHeight = params.find(param => param.name === "output_height")?.value;
            await synthesize_texture(sampleImagePath, outputWidth, outputHeight);
            return {
                
            }

        case "colorize_photo":
            const colorizeImagePath = params.find(param => param.name === "image_path")?.value;
            await colorize_photo(colorizeImagePath);
            return {
                
            }

        case "edit_face":
            const editFaceImagePath = params.find(param => param.name === "image_path")?.value;
            const edits = params.find(param => param.name === "edits")?.value;
            await edit_face(editFaceImagePath, edits);
            return {
                
            }

        case "remove_background":
            const removeBackgroundImagePath = params.find(param => param.name === "image_path")?.value;
            const newBackgroundPath = params.find(param => param.name === "new_background_path")?.value;
            await remove_background(removeBackgroundImagePath, newBackgroundPath);
            return {
                
            }

        case "apply_artistic_filter":
            const artisticFilterImagePath = params.find(param => param.name === "image_path")?.value;
            const filterType = params.find(param => param.name === "filter_type")?.value;
            await apply_artistic_filter(artisticFilterImagePath, filterType);
            return {
                
            }

        case "generate_3d_model":
            const sketchImagePath = params.find(param => param.name === "sketch_image_path")?.value;
            await generate_3d_model(sketchImagePath);
            return {
                
            }

        case "interpolate_video_frames":
            const videoPath = params.find(param => param.name === "video_path")?.value;
            const targetFrameRate = params.find(param => param.name === "target_frame_rate")?.value;
            await interpolate_video_frames(videoPath, targetFrameRate);
            return {
                
            }

        case "apply_video_style_transfer":
            const videoStyleTransferPath = params.find(param => param.name === "video_path")?.value;
            const videoStyleImagePath = params.find(param => param.name === "style_image_path")?.value;
            await apply_video_style_transfer(videoStyleTransferPath, videoStyleImagePath);
            return {
                
            }

        default:
            default_callback()
            return {
                
            }
    }

}

// Function Definitions
async function apply_style_transfer(contentImagePath: File, styleImagePath?: File) {
    const formData = new FormData();
    formData.append('content_image', contentImagePath);
    if (styleImagePath) {
        formData.append('style_image', styleImagePath);
    }

    try {
        const response = await axios.post(`${IMAGE_PROCESSING_ENDPOINT}/style-transfer`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            responseType: 'blob',
        });

        // Create a URL for the image blob
        const url = URL.createObjectURL(response.data);
        console.log("url",url)
        return {
            url :url,
            success : true
        };
    } catch (error) {
        console.error('Error applying style transfer:', error);
        return {
            message :  "Oups! Something went wrong please try again later.",
            success : false
        };
    }
}

async function enhance_resolution(image_path: File, target_width: number, target_height: number) {
    // Implement function logic here
    const formData = new FormData();
    formData.append('file', image_path);

    try {
        const response = await axios.post('http://localhost:5002/upscale', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            responseType: 'blob',
        });

        // Create a URL for the image blob
        const url = URL.createObjectURL(response.data);
        console.log("upscale url",url)
        return {
            url :url,
            success : true
        };
    } catch (error) {
        console.error('Error applying style transfer:', error);
        return {
            message :  "Oups! Something went wrong please try again later.",
            success : false
        };
    }
}

async function fill_missing_parts(image_path: string, mask_path: string) {
    // Implement function logic here
}

async function generate_design(input_params: any) {
    // Implement function logic here
}

async function synthesize_texture(sample_image_path: string, output_width: number, output_height: number) {
    // Implement function logic here
}

async function colorize_photo(image_path: string) {
    // Implement function logic here
}

async function edit_face(image_path: string, edits: any) {
    // Implement function logic here
}

async function remove_background(image_path: string, new_background_path: string = '') {
    // Implement function logic here
}

async function apply_artistic_filter(image_path: string, filter_type: string) {
    // Implement function logic here
}

async function generate_3d_model(sketch_image_path: string) {
    // Implement function logic here
}

async function interpolate_video_frames(video_path: string, target_frame_rate: number) {
    // Implement function logic here
}

async function apply_video_style_transfer(video_path: string, style_image_path: string) {
    // Implement function logic here
}

async function generate_image_from_text(description: string) {
    // Implement function logic here
    
    try {
        const response = await axios.post(`${IMAGE_PROCESSING_ENDPOINT}/sdxl/text2img`, {
            "prompt": description,
            "steps": 5
        },{
            responseType: 'blob',
        });
        const url = URL.createObjectURL(response.data);
        // // Assuming the response data contains the base64-encoded image at 'images[0]'
        // const base64Image = response.data.images[0];
        // console.log("response.data.images",response.data.images?.length)
        // // Convert the base64 string to a binary buffer
        // const binaryString = atob(base64Image);
        // const len = binaryString.length;
        // const bytes = new Uint8Array(len);
        // for (let i = 0; i < len; i++) {
        //     bytes[i] = binaryString.charCodeAt(i);
        // }

        // // Create a Blob from the binary data
        // const blob = new Blob([bytes.buffer], { type: 'image/png' });

        // // Create a URL for the Blob
        // const imageUrl = URL.createObjectURL(blob);

        return {
            url: url,
            success: true
        };
    } catch (error) {
        console.error('Error applying style transfer:', error);
        return {
            message :  "Oups! Something went wrong please try again later.",
            success : false
        };
    }
}

async function default_callback() {
    // Implement function logic here
}

export const generateFilePath = (): string => {
    return `media.gaistai://file_${uuidv4()}`;
};

function getRandomMessage(messages:string[]): string {
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
}