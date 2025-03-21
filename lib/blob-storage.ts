import { put } from "@vercel/blob"
import { nanoid } from "nanoid"

/**
 * Faz upload de um arquivo para o Vercel Blob Storage
 * @param file Arquivo a ser enviado
 * @param folder Pasta onde o arquivo será armazenado
 * @returns URL do arquivo no Blob Storage
 */
export async function uploadToBlob(file: File, folder = "images"): Promise<string> {
  try {
    // Gerar um ID único para o arquivo
    const uniqueId = nanoid()

    // Obter a extensão do arquivo
    const extension = file.name.split(".").pop() || "jpg"

    // Criar um nome de arquivo único
    const filename = `${folder}/${uniqueId}-${Date.now()}.${extension}`

    // Fazer upload do arquivo para o Blob Storage
    const blob = await put(filename, file, {
      access: "public",
      token: process.env.sidrinho_READ_WRITE_TOKEN || "",
    })

    // Retornar a URL do arquivo
    return blob.url
  } catch (error) {
    console.error("Erro ao fazer upload para o Blob Storage:", error)
    throw new Error("Falha ao fazer upload da imagem")
  }
}

