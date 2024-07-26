import  {useState, useRef, useEffect, ChangeEvent } from 'react';
import './index.scss';
import { generateFilePath, handleFunctionCallString } from './utils/utils';
import { GaistAIMessage, GaistrAIMessageProps, MessageFile } from './components/gaist-ai-comp';


type Message = {text:string,files?:MessageFile[]}
export default function GaistAI() {



    const [message, setMessage] = useState<Message>({
        text: '',
        files: []
    });
    const contentEditableRef = useRef<HTMLDivElement>(null);
    const [chatMessages, setChatMessages] = useState<GaistrAIMessageProps[]>([
        {
            guest : "ai",
            content : `Hi, I'm LLM CLient by w4coder! I'm here to help you with any request you may have. To get you started, here are some templates you can use :`,
            actions : [
                "Write a short story about a robot who discovers an ancient civilization on Mars.",
                "In 3 sentences, explain how a blockchain works in simple terms.",
                "Discuss the impact of the Industrial Revolution on urbanization and how it shaped modern cities."
            ]?.map((cr)=>{
                
                return {
                    function : {
                        type : "direct",
                        run : async ()=> {return handleRunMessage({
                            text : cr
                        })}
                    },
                    ar : "4/3",
                    type: "text",
                    prompt : cr
                }
            })
        }
    ]);
    const [isStreaming, setIsStreaming] = useState(false);
    const controllerRef = useRef<AbortController | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);  // Add a ref for the chat container
    const runInference = async (message:string,files?:MessageFile[]) => {
        setIsStreaming(true);

        const controller = new AbortController();
        controllerRef.current = controller;
        var runFunction  = false
        let answer = '';
  

        try {
            // console.log("Start message", chatMessages)
            const response = await fetch('http://localhost:1234/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "model": "TheBloke/Mistral-7B-Instruct-v0.1-GGUF",
                    "messages": [
                        ...(chatMessages||[])?.slice(-5)?.map((chatMess)=>{
                            if(chatMess?.guest === "ai"){
                                return {
                                    "role": "assistant", "content": `${chatMess?.content?.toString()}` 
                                }
                            }
                            return {
                                "role": "user", "content": `${chatMess?.content?.toString()}` 
                            }
                        }),
                        { 
                            "role": "system", 
                            "content": `
                                Your are a question aswering agent with the ability to call a function when user request need it.
                                When the user request require to interract directly with files 
                                or interract with elements or an action you can't perform 
                                then you return a only a json object without any other text following this template: {
                                    "call_function" : {
                                        "name" : the function name to pick from Functions available bellow,
                                        "params" : an array of object params like { "name" : "param name", "value" : "param value"}
                                    },
                                    "extra_message": Some extra message you wan to add to the answer
                                }
                                Functions available:
                                1. apply_style_transfer(content_image_path: str, style_image_path: str) - Applies the artistic style from the style image to the content image.
                                2. enhance_resolution(image_path: str, target_width: int, target_height: int) - Enhances the resolution of the given image to the specified target width and height.
                                3. fill_missing_parts(image_path: str, mask_path: str) - Fills the missing or damaged parts of an image using the provided mask.
                                4. generate_template(prompt: str) - Automatically generates template design elements based on the input parameters.
                                5. synthesize_texture(sample_image_path: str, output_width: int, output_height: int) - Generates a seamless texture based on a small sample image, with the specified output width and height.
                                6. colorize_photo(image_path: str) - Converts a black and white photo to a colorized version.
                                7. edit_face(image_path: str, edits: dict) - Enhances or modifies facial features in the given image according to the specified edits (e.g., apply makeup, change expressions).
                                8. remove_background(image_path: str, new_background_path: str = None) - Removes the background from the image and optionally replaces it with a new background.
                                9. apply_artistic_filter(image_path: str, filter_type: str) - Applies an artistic filter to the image, such as watercolor, oil painting, or sketch.
                                10. generate_3d_model(sketch_image_path: str) - Generates a 3D model from a 2D sketch image.
                                11. interpolate_video_frames(video_path: str, target_frame_rate: int) - Smoothly interpolates between video frames to create slow-motion effects or increase the frame rate to the specified target frame rate.
                                12. apply_video_style_transfer(video_path: str, style_image_path: str) - Applies a consistent artistic style from the style image to the entire video.
                                13. generate_image_from_text(description: str) - Generates an image based on the provided textual description.
                                14. default() - Default function if no option above matched.
                            ` 
                        },
                        
                        { "role": "user", "content": `${message} ${(files && files?.length > 0)?` Here ${files?.length > 1 ? "are" : "is"} the image${files?.length > 1 ? "s" : ""} ${files?.map((f)=>{return f?.id})?.join(" ")}`:''}` }
                    ],
                    "temperature": 0.7,
                    "max_tokens": -1,
                    "stream": true
                }),
                signal: controller.signal,
            });

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let done = false;
            var firstRun = true
            while (!done) {
                const { value, done: doneReading } = await reader!.read();
                done = doneReading;
                const decodedChunk = decoder.decode(value);
                const lines = decodedChunk?.split("\n")
                // console.log(JSON.stringify(lines))
                const parsedLines = lines
                    .map((line) => line.replace(/^data:/, "").trim())
                    .filter((line) => line !== "" && line !== "[DONE]")
                    .map((line) => JSON.parse(line));

                    for (const parsedLine of parsedLines) {
                    const { choices } = parsedLine
                    const { delta } = choices[0]
                    const { content } = delta
                    if (content) {
                        var rewritecontent =content
                        if(["*"]?.includes(content)){
                            rewritecontent = "•"
                        }
                        if(["**"]?.includes(content)){
                            rewritecontent = ""
                        }
                        answer += rewritecontent;
                        // console.log({ content: answer, actions: [] })
                        if((answer?.startsWith("```") || answer?.startsWith("{")) && !runFunction){
                            console.log("Run function")
                            runFunction = true
                           
                            setChatMessages((prev) => {
                                return [...prev, { 
                                    guest: "ai", 
                                    content: "", 
                                    actions: [] ,
                                    function : {
                                        state : 'init',
                                        params : ""
                                    }
                                }]
                            });
                        }
                        if(!runFunction){

                            if (firstRun) {
                                setChatMessages((prev) => {
                                    return [...prev, { guest: "ai", content: answer, actions: [] }]
                                });
                                firstRun = false
                            } else {
                                setChatMessages((prev) => {
                                    // Create a copy of the previous state
                                    const newChatMessages = [...prev];
    
                                    // Modify the last element
                                    if (newChatMessages.length > 0) {
                                        newChatMessages[newChatMessages.length - 1] = {
                                            ...newChatMessages[newChatMessages.length - 1],
                                            content: answer+`\n`,
                                            actions: []
                                        };
                                    } else {
                                        // If the previous state is empty, just add the new message
                                        newChatMessages.push({ guest: "ai", content: answer+`\n`, actions: [] });
                                    }
    
                                    return newChatMessages;
                                });
                            }
                        }else{

                        }

                    }
                    // answer += '\n'
                }
            }
            // const assistantMessage: MessageProps = { content: answer, actions: [] };
            // setChatMessages([...chatMessages, assistantMessage]);
        } catch (error:any) {
            console.log("error",error)
            if (error.name !== 'AbortError') {
                console.error('Failed to fetch chat completions:', error);
            }else{
                setChatMessages((prev) => {
                    return [...prev, {
                        guest : "error",
                        content : " High usage is causing delays, but we're on it!"
                    }]
                });
            }
        } finally {
            setIsStreaming(false);
            if(runFunction){
                handleFunctionCallString(answer,files,(additionalMessage)=>{

                    const {content,actions} = additionalMessage
                    console.log("handleFunctionCallString",{content,actions})
                    setChatMessages((prev) => {
                        // Create a copy of the previous state
                        const newChatMessages = [...prev];
                
                        // Modify the last element
                        if (newChatMessages.length > 0) {
                            newChatMessages[newChatMessages.length - 1] = {
                                ...newChatMessages[newChatMessages.length - 1],
                                content: `${content}`,
                                actions: actions,
                                function : {
                                    state : "end"
                                }
                            };
                        } else {
                            // If the previous state is empty, just add the new message
                            newChatMessages.push({ guest: "ai", content:  `${content}`, actions: actions });
                        }
                
                        return newChatMessages;
                    });
                })
            }
        }

    }

    //Resize this image https://myimage.com/slug.png to 500x500

    // console.log("End message", chatMessages)

    // console.log("Message", message)

    const handleSendMessage = async () => {
        if (message?.text.trim() === '') return;
        handleRunMessage(message)
        if (contentEditableRef.current) {
            contentEditableRef.current.innerHTML = '';
        }
        setMessage((prev)=>{
            return {
                files: [],
                text : ''
            }
        });
    };

    const handleRunMessage = async (message:Message) => {
        if (message?.text.trim() === '') return;

       
        const userMessage: GaistrAIMessageProps = { 
            guest: "host", 
            content: message?.text, 
            actions: message?.files?.map((file)=>{
                return  {
                    function : {
                        
                    },
                    type : "image",
                    ar : "1/1",
                    hideActions : true,
                    file : {
                        type : "image",
                        content : file.url
                    }
                }
            }) 
        };
        setChatMessages((prev) => {
            return [...prev, userMessage]
        });
        runInference(message?.text?.trim(),message?.files)

    };

    const handleStopStreaming = () => {
        if (controllerRef.current) {
            controllerRef.current.abort();
            setIsStreaming(false);
        }
    };

    // const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    //     const selectedFile = event.target.files?.[0];
    //     if (selectedFile) {
    //       setMessage((prev)=>{
    //         return {
    //             ...prev,
    //             file : selectedFile
    //         }
    //       });
    //       setPreviewUrl(URL.createObjectURL(selectedFile));
    //     }
    // };

    const handleRemoveFile = (id:string) => {

        setMessage((prev)=>{
            var removed = prev?.files?.find((f)=>{return f?.id == id})
            if(removed){
                URL.revokeObjectURL(removed.url)
            }
            return {
                ...prev,
                files : prev?.files?.filter((f)=>{return f?.id != id})
            }
        });
       
    };

    
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            // Create a new object to store the files with unique IDs
            const newFiles = Array.from(files).map((file) => {
                const fileId = generateFilePath();
                return {
                    id: fileId,
                    file :file,
                    url: URL.createObjectURL(file),
                };
            });
        
            // Update state with the new files
            setMessage((prev) => ({
                ...prev,
                files: [...prev.files ||[],...newFiles],
            }));
        }
    };

    const handleUseImage = (imageurl:any) =>{
        if(imageurl){
            const fileId = generateFilePath();
            const newFiles = {
                id: fileId,
                file : imageurl,
                url: imageurl,
            };
        
            // Update state with the new files
            setMessage((prev) => ({
                ...prev,
                files: [...prev.files ||[],newFiles],
            }));
        }
    }

    // useEffect to scroll to the bottom whenever chatMessages change
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatMessages]);

    return (
        <div className="gaist-panel-wrapper">
            <div className="gaist-client">
                <div className="gaist-client-header">
                    <div className="gaist-client-header-info">
                        <svg style={{ width: 33, height: 33, color: "var(--text-color)"}} xmlns="http://www.w3.org/2000/svg" id="Calque_2" data-name="Calque 2" viewBox="0 0 122.03 122.03">
                            <g id="Calque_1-2" data-name="Calque 1">
                            <g>
                                <path  fill="currentColor"  d="m50.19,11.5v-2.25c.06-.53.26-.97.88-1.29h25.32V2.03c-4.92-1.28-10.06-2.03-15.38-2.03-6.69,0-13.12,1.12-19.14,3.11v29.49l8.32-20.86s0-.1,0-.24Z"/>
                                <path  fill="currentColor"  d="m88.37,18.35l1.59-1.59c.42-.33.87-.5,1.54-.29l17.9,17.9,4.2-4.2c-5.94-10.11-14.69-18.33-25.19-23.63l-20.84,20.84s20.71-8.94,20.8-9.04Z"/>
                                <path  fill="currentColor"  d="m118.92,41.87h-29.49l20.86,8.32h0s2.48,0,2.48,0c.53.06.97.26,1.29.88v25.32h5.93c1.28-4.92,2.03-10.06,2.03-15.38,0-6.69-1.12-13.12-3.11-19.14Z"/>
                                <path  fill="currentColor"  d="m103.51,88.21s.07.07.17.17l1.59,1.59c.33.42.5.87.29,1.54l-17.9,17.9,4.2,4.2c10.11-5.94,18.33-14.68,23.63-25.19l-20.84-20.84,8.87,20.64Z"/>
                                <path  fill="currentColor"  d="m71.83,110.29s0,.1,0,.24v2.25c-.06.53-.26.97-.88,1.29h-25.32v5.93c4.92,1.28,10.06,2.03,15.38,2.03,6.69,0,13.12-1.12,19.14-3.11v-29.49l-8.32,20.86h0Z"/>
                                <path  fill="currentColor"  d="m33.82,103.51h0s-.07.07-.17.17l-1.59,1.59c-.42.33-.87.5-1.54.29l-17.9-17.9-4.2,4.2c5.94,10.11,14.69,18.33,25.19,23.63l20.84-20.84-20.64,8.87Z"/>
                                <path  fill="currentColor"  d="m11.74,71.84s-.1,0-.24,0h-2.25c-.53-.06-.97-.26-1.29-.88v-25.32H2.03c-1.28,4.92-2.03,10.06-2.03,15.38,0,6.69,1.12,13.12,3.11,19.14h29.49l-20.86-8.32Z"/>
                                <path  fill="currentColor"  d="m18.52,33.82h0s-.07-.07-.17-.17l-1.59-1.59c-.33-.42-.5-.87-.29-1.54l17.9-17.9-4.2-4.2c-10.11,5.94-18.33,14.69-23.63,25.19l20.84,20.84-8.87-20.64Z"/>
                            </g>
                            </g>
                            <p style={{ marginLeft: '10px' }}>© 2024 GatheredAI. All rights reserved.</p>
                        </svg>
                        <svg style={{ width: 35, height: 35, color: "var(--text-color)"}} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M12.9046 3.06005C12.6988 3 12.4659 3 12 3C11.5341 3 11.3012 3 11.0954 3.06005C10.7942 3.14794 10.5281 3.32808 10.3346 3.57511C10.2024 3.74388 10.1159 3.96016 9.94291 4.39272C9.69419 5.01452 9.00393 5.33471 8.36857 5.123L7.79779 4.93281C7.3929 4.79785 7.19045 4.73036 6.99196 4.7188C6.70039 4.70181 6.4102 4.77032 6.15701 4.9159C5.98465 5.01501 5.83376 5.16591 5.53197 5.4677C5.21122 5.78845 5.05084 5.94882 4.94896 6.13189C4.79927 6.40084 4.73595 6.70934 4.76759 7.01551C4.78912 7.2239 4.87335 7.43449 5.04182 7.85566C5.30565 8.51523 5.05184 9.26878 4.44272 9.63433L4.16521 9.80087C3.74031 10.0558 3.52786 10.1833 3.37354 10.3588C3.23698 10.5141 3.13401 10.696 3.07109 10.893C3 11.1156 3 11.3658 3 11.8663C3 12.4589 3 12.7551 3.09462 13.0088C3.17823 13.2329 3.31422 13.4337 3.49124 13.5946C3.69158 13.7766 3.96395 13.8856 4.50866 14.1035C5.06534 14.3261 5.35196 14.9441 5.16236 15.5129L4.94721 16.1584C4.79819 16.6054 4.72367 16.829 4.7169 17.0486C4.70875 17.3127 4.77049 17.5742 4.89587 17.8067C5.00015 18.0002 5.16678 18.1668 5.5 18.5C5.83323 18.8332 5.99985 18.9998 6.19325 19.1041C6.4258 19.2295 6.68733 19.2913 6.9514 19.2831C7.17102 19.2763 7.39456 19.2018 7.84164 19.0528L8.36862 18.8771C9.00393 18.6654 9.6942 18.9855 9.94291 19.6073C10.1159 20.0398 10.2024 20.2561 10.3346 20.4249C10.5281 20.6719 10.7942 20.8521 11.0954 20.94C11.3012 21 11.5341 21 12 21C12.4659 21 12.6988 21 12.9046 20.94C13.2058 20.8521 13.4719 20.6719 13.6654 20.4249C13.7976 20.2561 13.8841 20.0398 14.0571 19.6073C14.3058 18.9855 14.9961 18.6654 15.6313 18.8773L16.1579 19.0529C16.605 19.2019 16.8286 19.2764 17.0482 19.2832C17.3123 19.2913 17.5738 19.2296 17.8063 19.1042C17.9997 18.9999 18.1664 18.8333 18.4996 18.5001C18.8328 18.1669 18.9994 18.0002 19.1037 17.8068C19.2291 17.5743 19.2908 17.3127 19.2827 17.0487C19.2759 16.8291 19.2014 16.6055 19.0524 16.1584L18.8374 15.5134C18.6477 14.9444 18.9344 14.3262 19.4913 14.1035C20.036 13.8856 20.3084 13.7766 20.5088 13.5946C20.6858 13.4337 20.8218 13.2329 20.9054 13.0088C21 12.7551 21 12.4589 21 11.8663C21 11.3658 21 11.1156 20.9289 10.893C20.866 10.696 20.763 10.5141 20.6265 10.3588C20.4721 10.1833 20.2597 10.0558 19.8348 9.80087L19.5569 9.63416C18.9478 9.26867 18.6939 8.51514 18.9578 7.85558C19.1262 7.43443 19.2105 7.22383 19.232 7.01543C19.2636 6.70926 19.2003 6.40077 19.0506 6.13181C18.9487 5.94875 18.7884 5.78837 18.4676 5.46762C18.1658 5.16584 18.0149 5.01494 17.8426 4.91583C17.5894 4.77024 17.2992 4.70174 17.0076 4.71872C16.8091 4.73029 16.6067 4.79777 16.2018 4.93273L15.6314 5.12287C14.9961 5.33464 14.3058 5.0145 14.0571 4.39272C13.8841 3.96016 13.7976 3.74388 13.6654 3.57511C13.4719 3.32808 13.2058 3.14794 12.9046 3.06005Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                    </div>
                </div>
                <div className="gaist-client-dialog">
                    <div className='placeholder' ref={chatContainerRef}>
                        {chatMessages.map((msg, i) => (
                            <GaistAIMessage 
                                handleUseImage={handleUseImage}
                                key={i} 
                                guest={msg.guest} 
                                content={msg.content} 
                                actions={msg.actions} 
                                loading={msg?.function?.state == "init" || msg?.function?.state == "ready"} 
                            />
                        ))}
                    </div>
                </div>
                <div className="gaist-client-message">
                    <button  disabled={!!(message && message?.files && message?.files?.length>0)} className="gaist-client-message-btn">
                        <svg 
                            width={24} 
                            height={30} 
                            viewBox="0 0 512 512" 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="currentColor"
                            stroke='currentColor'
                            style={{
                                fill:'none',
                                color: "var(--text-color)",
                                strokeLinecap:'round',
                                strokeMiterlimit:'10',
                                strokeWidth:'32px'
                            }}
                        >
                            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                            <g id="SVGRepo_iconCarrier">
                                <path d="M216.08,192V335.85a40.08,40.08,0,0,0,80.15,0l.13-188.55a67.94,67.94,0,1,0-135.87,0V337.12a95.51,95.51,0,1,0,191,0V159.74" ></path>
                            </g>
                        </svg>
                        <input 
                            multiple 
                            // disabled={!!(message && message?.files && message?.files?.length>0)} 
                            onChange={handleFileChange}  
                            type='file' 
                            accept='image/*'
                        />

                    </button>
                    <div className="gaist-client-message-content">
                        {(message && message?.files && message?.files?.length>0)&&(
                            <div className="gaist-client-message-content-file">
                                {message?.files?.map((pv,idx)=>(
                                    <div  key={idx} className="gaist-assistant-preview-image-box">
                                        <img src={pv.url} alt="Preview" className="gaist-assistant-preview-image" />
                                        <button onClick={(e)=>handleRemoveFile(pv?.id)} className="gaist-assistant-remove-button">&times;</button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div
                            className={`gaist-client-message-content-text ${(message?.text?.length == 0)?'placeholder':''}`}
                            role="textbox"
                            contentEditable
                            // placeholder='Ask assistant'
                            onInput={(e) => {
                                var text =  e.currentTarget.textContent 
                                setMessage((prev)=>{
                                    return {
                                        ...prev,
                                        text : text || ''
                                    }
                                })
                            }}
                            ref={contentEditableRef}
                        />
                    </div>
                    {isStreaming ? (
                        <button onClick={handleStopStreaming} className="gaist-client-message-btn-fill">
                            <div className='messaging-btn'>
                                <svg width="10" height="10" viewBox="0 0 28 28" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier">
                                    <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd"> <g id="Icon-Set-Filled" transform="translate(-520.000000, -571.000000)" fill="currentColor"> <path d="M546,571 L522,571 C520.896,571 520,571.896 520,573 L520,597 C520,598.104 520.896,599 522,599 L546,599 C547.104,599 548,598.104 548,597 L548,573 C548,571.896 547.104,571 546,571" id="stop" > </path> </g> </g> </g>
                                </svg> 
                            </div>
                        </button>
                    ) : (
                        <button onClick={handleSendMessage} disabled={!(message?.text?.length > 2)} className="gaist-client-message-btn-fill">
                            <div className='messaging-btn'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 32 32">
                                    <path fill="currentColor" fillRule="evenodd" d="M15.192 8.906a1.143 1.143 0 0 1 1.616 0l5.143 5.143a1.143 1.143 0 0 1-1.616 1.616l-3.192-3.192v9.813a1.143 1.143 0 0 1-2.286 0v-9.813l-3.192 3.192a1.143 1.143 0 1 1-1.616-1.616z" clipRule="evenodd"></path>
                                </svg>
                            </div>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
