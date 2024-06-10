import type { GeneratedTypes } from 'payload'

import type { Payload } from 'payload'

export async function loadRelated<T extends keyof GeneratedTypes['collections']>(
  payload: Payload,
  value: string,
  relationTo: T,
  depth: number,
  locale: any
): Promise<GeneratedTypes['collections'][T] | null> {
  try {
    const relatedDoc = await payload.findByID({
      collection: relationTo,
      id: value,
      depth,
      locale
    })
    return relatedDoc
  } catch (error) {
    console.error(error)
    return null
  }
}
