/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { User } from './entity/User'

// Provide resolver functions for your schema fields
export const resolvers = {
  Query: {
    getUser: async (_: any, args: any) => {
      const { id } = args

      return await User.findOne({ where: { id: id } })
    },

    getAllUsers: async () => {
      return await User.find()
    }

  },
  Mutation: {
    addUser: async (_: any, args: any) => {
      const { firstName, lastName, age, email } = args
      try {
        const user = User.create({
          firstName,
          lastName,
          age,
          email,
          createDate: Date()
        })

        await user.save()

        return true
      } catch (error) {
        return false
      }
    },
    deleteUser: async (_: any, args: any) => {
      const { id } = args
      try {
        await User.delete(id)
        console.log(User)
        return true
      } catch (error) {
        return false
      }
    }
  }
}
