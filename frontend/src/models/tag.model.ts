export interface ITag {
  id: string
  name: string
  slug: string
  createdAt: string
}

export interface ITagView extends Omit<ITag, 'createdAt'> {
  createdAt: Date | string
}

export interface ICreateTagPayload {
  name: string
}

export interface IUpdateTagPayload {
  name?: string
}
