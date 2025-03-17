import mongoose, { Schema, type Document } from "mongoose"

// Função para gerar slug a partir do nome da loja
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Substitui espaços por hífens
    .replace(/[^\w-]+/g, "") // Remove caracteres não alfanuméricos
    .replace(/--+/g, "-") // Substitui múltiplos hífens por um único hífen
    .replace(/^-+/, "") // Remove hífens do início
    .replace(/-+$/, "") // Remove hífens do final
}

export interface LojaDocument extends Document {
  proprietarioId: string
  nome: string
  slug: string
  descricao?: string
  logo?: string
  banner?: string
  cnpj?: string
  inscricaoEstadual?: string
  inscricaoMunicipal?: string
  razaoSocial?: string
  nomeFantasia?: string
  dataAbertura?: Date
  regimeTributario?: "simples_nacional" | "lucro_presumido" | "lucro_real" | "mei"
  endereco: {
    rua: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    cep: string
    coordenadas?: {
      latitude: number
      longitude: number
    }
  }
  contato: {
    telefone: string
    email: string
    whatsapp?: string
    instagram?: string
    facebook?: string
    site?: string
  }
  categorias?: string[]
  horarioFuncionamento?: {
    segunda?: string
    terca?: string
    quarta?: string
    quinta?: string
    sexta?: string
    sabado?: string
    domingo?: string
    feriados?: string
  }
  configuracoes?: {
    entrega?: {
      raioEntrega?: number
      taxaEntrega?: number
      tempoEstimadoEntrega?: string
      entregaGratis?: boolean
      valorMinimoEntregaGratis?: number
    }
    pagamento?: {
      aceitaDinheiro?: boolean
      aceitaCartao?: boolean
      aceitaPix?: boolean
      aceitaTransferencia?: boolean
      aceitaBoleto?: boolean
      stripeConnectId?: string
      pixChaves?: Array<{
        tipo: "cpf" | "cnpj" | "email" | "telefone" | "aleatoria"
        chave: string
        descricao?: string
      }>
      contaBancaria?: {
        banco: string
        agencia: string
        conta: string
        tipoConta: "corrente" | "poupanca"
        nomeTitular: string
        cpfCnpjTitular: string
      }
    }
  }
  status: "ativo" | "inativo" | "pendente"
  dataCriacao: Date
  dataAtualizacao: Date
}

const LojaSchema = new Schema<LojaDocument>(
  {
    proprietarioId: { type: String, required: true },
    nome: { type: String, required: true },
    slug: { type: String, unique: true },
    descricao: { type: String },
    logo: { type: String },
    banner: { type: String },
    cnpj: { type: String },
    inscricaoEstadual: { type: String },
    inscricaoMunicipal: { type: String },
    razaoSocial: { type: String },
    nomeFantasia: { type: String },
    dataAbertura: { type: Date },
    regimeTributario: {
      type: String,
      enum: ["simples_nacional", "lucro_presumido", "lucro_real", "mei"],
    },
    endereco: {
      rua: { type: String, required: true },
      numero: { type: String, required: true },
      complemento: { type: String },
      bairro: { type: String, required: true },
      cidade: { type: String, required: true },
      estado: { type: String, required: true },
      cep: { type: String, required: true },
      coordenadas: {
        latitude: { type: Number },
        longitude: { type: Number },
      },
    },
    contato: {
      telefone: { type: String, required: true },
      email: { type: String, required: true },
      whatsapp: { type: String },
      instagram: { type: String },
      facebook: { type: String },
      site: { type: String },
    },
    categorias: [{ type: String }],
    horarioFuncionamento: {
      segunda: { type: String },
      terca: { type: String },
      quarta: { type: String },
      quinta: { type: String },
      sexta: { type: String },
      sabado: { type: String },
      domingo: { type: String },
      feriados: { type: String },
    },
    configuracoes: {
      entrega: {
        raioEntrega: { type: Number },
        taxaEntrega: { type: Number },
        tempoEstimadoEntrega: { type: String },
        entregaGratis: { type: Boolean, default: false },
        valorMinimoEntregaGratis: { type: Number },
      },
      pagamento: {
        aceitaDinheiro: { type: Boolean, default: true },
        aceitaCartao: { type: Boolean, default: false },
        aceitaPix: { type: Boolean, default: false },
        aceitaTransferencia: { type: Boolean, default: false },
        aceitaBoleto: { type: Boolean, default: false },
        stripeConnectId: { type: String },
        pixChaves: [
          {
            tipo: { type: String, enum: ["cpf", "cnpj", "email", "telefone", "aleatoria"] },
            chave: { type: String },
            descricao: { type: String },
          },
        ],
        contaBancaria: {
          banco: { type: String },
          agencia: { type: String },
          conta: { type: String },
          tipoConta: { type: String, enum: ["corrente", "poupanca"] },
          nomeTitular: { type: String },
          cpfCnpjTitular: { type: String },
        },
      },
    },
    status: { type: String, enum: ["ativo", "inativo", "pendente"], default: "ativo" },
    dataCriacao: { type: Date, default: Date.now },
    dataAtualizacao: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: "dataCriacao", updatedAt: "dataAtualizacao" } },
)

// Middleware para gerar o slug antes de salvar
LojaSchema.pre("save", function (next) {
  // Se o nome foi modificado ou o slug não existe, gere um novo slug
  if (this.isModified("nome") || !this.slug) {
    this.slug = slugify(this.nome)
  }
  next()
})

// Verificar se o modelo já foi compilado para evitar erros de sobrescrita
const Loja = mongoose.models.Loja || mongoose.model<LojaDocument>("Loja", LojaSchema)

export default Loja

