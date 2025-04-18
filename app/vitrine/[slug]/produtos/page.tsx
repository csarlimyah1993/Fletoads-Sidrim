import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import ProdutosPageClient from "./ProdutosPageClient";

interface VitrinePageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getLojaBySlug(slug: string) {
  try {
    const { db } = await connectToDatabase();
    const loja = await db.collection("lojas").findOne({
      $or: [{ "vitrine.slug": slug }, { vitrineId: slug }],
    });

    if (!loja) {
      return null;
    }

    return {
      ...loja,
      id: loja._id.toString(),
      _id: loja._id.toString(),
      nome: loja.nome,
      vitrine: loja.vitrine,
      dataCriacao: loja.dataCriacao ? loja.dataCriacao.toISOString() : null,
      dataAtualizacao: loja.dataAtualizacao ? loja.dataAtualizacao.toISOString() : null,
    };
  } catch (error) {
    console.error("Erro ao buscar vitrine:", error);
    return null;
  }
}

async function getProdutosByLojaId(lojaId: string): Promise<any[]> {
  try {
    const { db } = await connectToDatabase();
    const produtos = await db
      .collection("produtos")
      .find({
        lojaId: lojaId,
        ativo: { $ne: false },
      })
      .sort({ destaque: -1, dataCriacao: -1 })
      .toArray();

    return produtos.map((produto) => ({
      ...produto,
      _id: produto._id.toString(),
      dataCriacao: produto.dataCriacao ? produto.dataCriacao.toISOString() : null,
      dataAtualizacao: produto.dataAtualizacao ? produto.dataAtualizacao.toISOString() : null,
    }));
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return [];
  }
}

export default async function VitrinePage({ params, searchParams }: VitrinePageProps) {
  const { slug } = await params;

  const loja = await getLojaBySlug(slug);
  if (!loja) {
    notFound();
  }

  const produtos = await getProdutosByLojaId(loja._id);
  const vitrineConfig = loja.vitrine || {};

  return <ProdutosPageClient slug={slug} lojas={[loja]} produtos={produtos} config={vitrineConfig} />;
}
