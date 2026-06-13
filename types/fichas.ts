export type Ficha = {
  id: string;
  conteudo: string;
  created_at: string;
  titulos?: {
    id: string;
    titulo: string;
  };
};

export type Titulo = {
  id: string;
  titulo: string;
};

export type ApiResponse = {
  success?: boolean;
  data?: Ficha[];
  error?: string;
};