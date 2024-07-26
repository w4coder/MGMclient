import { ReactNode } from "react";
import { v4 as uuidv4 } from 'uuid';
type ActionType = {
    function?: {
        type ?: string,
        run?: string | (()=>any ) | Promise<void>
    };
    type: string;
    ar : string;
    hideActions?:boolean;
    file?: {
        type : string;
        content : string;
    }
    prompt?:string
}

export type GaistrAIMessageProps = {
    guest: string
    content: string | ReactNode;
    loading?: boolean;
    actions?: ActionType[];
    handleUseImage?:(e:any)=>void
    function?: {
        state?: string;
        params?: string;
    }
};

export  type MessageFile = { id:string, file: File; url: string }

type ActionProps = {
    action: ActionType
    idx:number
    runAction: ((e:any)=>any )
    handleUseImage?:(e:any)=>void
}

export function ImageBasedAction({action,idx,runAction,handleUseImage}:ActionProps){

    const handleDownload = (type="webp") =>{
        if(action?.file?.content){
            const link = document.createElement('a');
            link.href = action?.file?.content;
            link.download = `${uuidv4()}.${type}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
       
    }

    return(
        <div className="gaist-client-message-box-preview">
            <div 
                style={{aspectRatio : action?.ar ||"9/16" }} 
                // className="gaist-client-message-box-preview"
                onClick={(e)=>{
                    action.function && runAction(action.function)
                }}
            >
                {(action.file && action.file.type == "image") && (
                    <img src={action.file.content}/>
                )}
            </div>
            {(action.type == "image"  && !action?.hideActions) ? (
                <div key={idx} className="gaist-message-box-previews-actions-action">
                    <div 
                        className="gaist-message-box-previews-actions-action-item" 
                        onClick={(e)=>{
                            handleUseImage && handleUseImage(action?.file?.content)
                        }}
                    >{`U${idx+1}`}</div>
                    <div 
                        className="gaist-message-box-previews-actions-action-item"
                        onClick={(e)=>{
                            handleDownload()
                        }}
                    >
                        <svg 
                            viewBox="0 0 24 24" 
                            width={15} 
                            height={15} 
                            fill="none" 
                            style={{
                                color: "var(--text-color)"
                            }}
                            xmlns="http://www.w3.org/2000/svg">
                                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                                <g id="SVGRepo_iconCarrier">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M9.163 2.819C9 3.139 9 3.559 9 4.4V11H7.803c-.883 0-1.325 0-1.534.176a.75.75 0 0 0-.266.62c.017.274.322.593.931 1.232l4.198 4.401c.302.318.453.476.63.535a.749.749 0 0 0 .476 0c.177-.059.328-.217.63-.535l4.198-4.4c.61-.64.914-.96.93-1.233a.75.75 0 0 0-.265-.62C17.522 11 17.081 11 16.197 11H15V4.4c0-.84 0-1.26-.164-1.581a1.5 1.5 0 0 0-.655-.656C13.861 2 13.441 2 12.6 2h-1.2c-.84 0-1.26 0-1.581.163a1.5 1.5 0 0 0-.656.656zM5 21a1 1 0 0 0 1 1h12a1 1 0 1 0 0-2H6a1 1 0 0 0-1 1z" fill="currentColor"></path>
                                </g>
                        </svg>{`${idx+1}`}</div>
                </div>
            ):<></>}
        </div>
    )
} 

export function TextBasedAction({action,idx,runAction}:ActionProps){
    return(
        <div 
            onClick={(e)=>{
                action.function && runAction(action.function)
            }}
            style={{aspectRatio : action?.ar ||"9/16" }}  
            className="gaist-client-message-box-preview gaist-client-message-box-preview-text"
        >
                {action?.prompt}
        </div>
    )
}

export function ShowAction({action,idx,runAction,handleUseImage}:ActionProps) {
    switch(action.type){
        case "template":
            return (
                <ImageBasedAction 
                    action={action}
                    idx={idx}
                    runAction={runAction}
                    handleUseImage={handleUseImage}
                />
            )
        case "image":
            return (
                <ImageBasedAction 
                    action={action}
                    idx={idx}
                    runAction={runAction}
                    handleUseImage={handleUseImage}
                />
            )
        case "text":
            return (
                <TextBasedAction 
                    action={action}
                    idx={idx}
                    runAction={runAction}
                />
            )
    }
    return (
        <div></div>
    )
}

export function GaistAIMessage({ guest, content, actions,loading,handleUseImage }: GaistrAIMessageProps) {
    

    const  runAction = async (funtion: {
        type ?: string,
        run?: string | (()=>any ) | Promise<void>
    }) =>{
        if(funtion?.type == "direct"){
            funtion?.run && typeof funtion.run == "function" && funtion.run()
        }
    }

    if(guest=="error"){
        return (
            <div className="gaist-client-message-box">
                <div className="gaist-client-message-box-left">
                    <svg width="18" height="18" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 28C14 26.0633 13.6267 24.2433 12.88 22.54C12.1567 20.8367 11.165 19.355 9.905 18.095C8.645 16.835 7.16333 15.8433 5.46 15.12C3.75667 14.3733 1.93667 14 0 14C1.93667 14 3.75667 13.6383 5.46 12.915C7.16333 12.1683 8.645 11.165 9.905 9.905C11.165 8.645 12.1567 7.16333 12.88 5.46C13.6267 3.75667 14 1.93667 14 0C14 1.93667 14.3617 3.75667 15.085 5.46C15.8317 7.16333 16.835 8.645 18.095 9.905C19.355 11.165 20.8367 12.1683 22.54 12.915C24.2433 13.6383 26.0633 14 28 14C26.0633 14 24.2433 14.3733 22.54 15.12C20.8367 15.8433 19.355 16.835 18.095 18.095C16.835 19.355 15.8317 20.8367 15.085 22.54C14.3617 24.2433 14 26.0633 14 28Z" fill="var(--text-color)" />
                    </svg>
                </div>
                <div className="gaist-client-message-box-right gaist-client-message-box-error">
                    <pre>{content}</pre>
                    {loading ? (
                        <div className="gaist-client-message-box-right gaist-client-message-box-loading">
                            Processing ...
                        </div>
                    ):(<></>)}
                </div>
            </div> 
        )
    }
    return (
        <div className="gaist-client-message-box">
            <div className="gaist-client-message-box-left">
                {(guest == "ai") ? (
                    <svg width="18" height="18" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 28C14 26.0633 13.6267 24.2433 12.88 22.54C12.1567 20.8367 11.165 19.355 9.905 18.095C8.645 16.835 7.16333 15.8433 5.46 15.12C3.75667 14.3733 1.93667 14 0 14C1.93667 14 3.75667 13.6383 5.46 12.915C7.16333 12.1683 8.645 11.165 9.905 9.905C11.165 8.645 12.1567 7.16333 12.88 5.46C13.6267 3.75667 14 1.93667 14 0C14 1.93667 14.3617 3.75667 15.085 5.46C15.8317 7.16333 16.835 8.645 18.095 9.905C19.355 11.165 20.8367 12.1683 22.54 12.915C24.2433 13.6383 26.0633 14 28 14C26.0633 14 24.2433 14.3733 22.54 15.12C20.8367 15.8433 19.355 16.835 18.095 18.095C16.835 19.355 15.8317 20.8367 15.085 22.54C14.3617 24.2433 14 26.0633 14 28Z" fill="var(--text-color)" />
                    </svg>
                ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19.5119 5.85L13.5719 2.42C12.6019 1.86 11.4019 1.86 10.4219 2.42L4.49187 5.85C3.52187 6.41 2.92188 7.45 2.92188 8.58V15.42C2.92188 16.54 3.52187 17.58 4.49187 18.15L10.4319 21.58C11.4019 22.14 12.6019 22.14 13.5819 21.58L19.5219 18.15C20.4919 17.59 21.0919 16.55 21.0919 15.42V8.58C21.0819 7.45 20.4819 6.42 19.5119 5.85ZM12.0019 7.34C13.2919 7.34 14.3319 8.38 14.3319 9.67C14.3319 10.96 13.2919 12 12.0019 12C10.7119 12 9.67188 10.96 9.67188 9.67C9.67188 8.39 10.7119 7.34 12.0019 7.34ZM14.6819 16.66H9.32187C8.51187 16.66 8.04187 15.76 8.49187 15.09C9.17187 14.08 10.4919 13.4 12.0019 13.4C13.5119 13.4 14.8319 14.08 15.5119 15.09C15.9619 15.75 15.4819 16.66 14.6819 16.66Z" fill="currentColor"></path> </g>
                    </svg>
                )}
            </div>
            <div className="gaist-client-message-box-right">
                <pre>{content}</pre>
                {loading ? (
                    <div className="gaist-client-message-box-right gaist-client-message-box-loading skeleton">
                        Processing ...
                    </div>
                 ):(<></>)} 
                { (actions && actions?.length > 0) ? (
                    <div>
                        <div className="gaist-client-message-box-previews">
                            {actions?.map((act, i) => (
                                <ShowAction
                                    key={i}
                                    action={act}
                                    idx={i}
                                    runAction={runAction}
                                    handleUseImage={handleUseImage}
                                />
                               
                            ))}
                        </div>
                    </div>
                ) : (<></>)}
            </div>
        </div>
    );
}