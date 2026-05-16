import type { Component } from 'vue'

export interface SidebarSubMenuItem {
  name: string
  path: string
}

export interface SidebarMenuItem {
  icon: Component
  name: string
  path?: string
  badge?: string
  badgeTone?: 'primary' | 'success' | 'light' | 'error'
  subItems?: SidebarSubMenuItem[]
}

export interface SidebarMenuGroup {
  title: string
  items: SidebarMenuItem[]
}
