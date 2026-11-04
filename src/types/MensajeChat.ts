
import type Anthropic from "@anthropic-ai/sdk";


export type MensajeClaude = Anthropic.MessageParam;

export interface ChatRequest {
    conversacionId: number| null,
    mensaje:string,
}

export interface ChatResponse{
    conversacionId:number,
    respuesta:string,
}

