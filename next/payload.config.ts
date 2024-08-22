import path from 'path'
import { en } from 'payload/i18n/en'
import { lexicalEditor } from '@/payload/adapters/richtext-lexical'

import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

import { Users } from '@/payload/collections/users'
import { Minimal } from '@/payload/collections/minimal'
import { Compact } from '@/payload/collections/compact'
import { Full } from '@/payload/collections/full'
import { Debug } from '@/payload/collections/debug'
import { Media } from '@/payload/collections/media'

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname, 'src'),
    },
    autoLogin: {
      email: 'dev@payloadcms.com',
      password: 'test',
      prefillOnly: true,
    },
  },
  // @ts-ignore: return type for editorConfig is different
  editor: lexicalEditor(),
  collections: [Full, Minimal, Compact, Debug, Media, Users],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // db: postgresAdapter({
  //   pool: {
  //     connectionString: process.env.POSTGRES_URI || ''
  //   }
  // }),
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || '',
  }),

  /**
   * Payload can now accept specific translations from 'payload/i18n/en'
   * This is completely optional and will default to English if not provided
   */
  i18n: {
    supportedLanguages: { en },
  },

  async onInit(payload) {
    const existingUsers = await payload.find({
      collection: 'users',
      limit: 1,
    })

    if (existingUsers.docs.length === 0) {
      await payload.create({
        collection: 'users',
        data: {
          email: 'dev@payloadcms.com',
          password: 'test',
          roles: ['admin'],
        },
      })
    }
  },
  // Sharp is now an optional dependency -
  // if you want to resize images, crop, set focal point, etc.
  // make sure to install it and pass it to the config.

  // This is temporary - we may make an adapter pattern
  // for this before reaching 3.0 stable
  sharp,
})
