import type { Component } from 'vue'

export interface SidebarSubMenuItem {
  name: string
  path: string
}

export interface SidebarMenuItem {
  icon: Component
  name: string
  path?: string
  subItems?: SidebarSubMenuItem[]
}

export interface SidebarMenuGroup {
  title: string
  items: SidebarMenuItem[]
}
