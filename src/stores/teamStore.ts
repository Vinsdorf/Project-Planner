import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { TeamMember, TimeOff } from '@/types'

interface TeamStore {
  members: TeamMember[]
  timeOffs: TimeOff[]
  addMember: (member: Omit<TeamMember, 'id'>) => string
  updateMember: (id: string, updates: Partial<TeamMember>) => void
  deleteMember: (id: string) => void
  getMember: (id: string) => TeamMember | undefined
  addTimeOff: (timeOff: Omit<TimeOff, 'id'>) => string
  updateTimeOff: (id: string, updates: Partial<TimeOff>) => void
  deleteTimeOff: (id: string) => void
  getTimeOffsByMember: (memberId: string) => TimeOff[]
}

export const useTeamStore = create<TeamStore>()(
  persist(
    (set, get) => ({
      members: [],
      timeOffs: [],

      addMember: (memberData) => {
        const id = uuidv4()
        const member: TeamMember = { ...memberData, id }
        set((state) => ({ members: [...state.members, member] }))
        return id
      },

      updateMember: (id, updates) => {
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        }))
      },

      deleteMember: (id) => {
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
          timeOffs: state.timeOffs.filter((t) => t.memberId !== id),
        }))
      },

      getMember: (id) => {
        return get().members.find((m) => m.id === id)
      },

      addTimeOff: (timeOffData) => {
        const id = uuidv4()
        const timeOff: TimeOff = { ...timeOffData, id }
        set((state) => ({ timeOffs: [...state.timeOffs, timeOff] }))
        return id
      },

      updateTimeOff: (id, updates) => {
        set((state) => ({
          timeOffs: state.timeOffs.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }))
      },

      deleteTimeOff: (id) => {
        set((state) => ({
          timeOffs: state.timeOffs.filter((t) => t.id !== id),
        }))
      },

      getTimeOffsByMember: (memberId) => {
        return get().timeOffs.filter((t) => t.memberId === memberId)
      },
    }),
    {
      name: 'projectflow-team',
    }
  )
)
