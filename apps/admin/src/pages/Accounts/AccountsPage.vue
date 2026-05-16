<template>
  <AppShell>
    <div class="space-y-4">
      <PageBreadcrumb :pageTitle="t('accounts.title')">
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ t('accounts.description') }}
        </p>
      </PageBreadcrumb>

      <div class="mt-4 mb-4 flex flex-wrap items-center justify-end gap-2">
        <Button variant="outline" size="sm" className="gap-2">
          <template #default>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {{ t('accounts.actions.exportCsv') }}
          </template>
        </Button>
        <Button size="sm" className="gap-2" @click="handleInviteAdmin">
          <template #default>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {{ t('accounts.actions.inviteAdmin') }}
          </template>
        </Button>
      </div>
    </div>

    <div class="space-y-4 pb-6">
      <section
        class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div
          class="grid grid-cols-1 divide-y divide-gray-100 dark:divide-gray-800 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">
          <div v-for="card in statCards" :key="card.label" class="relative min-w-0 px-5 py-4">
            <div :class="[
              'absolute right-4 top-4 inline-flex h-7 w-7 items-center justify-center rounded-full',
              card.iconBg,
            ]">
              <span :class="card.iconColor" v-html="card.icon"></span>
            </div>
            <div class="text-[11px] font-semibold uppercase tracking-[0.04em] text-gray-500 dark:text-gray-400">
              {{ card.label }}
            </div>
            <div class="mt-2 text-[26px] font-semibold tracking-[-0.02em] text-gray-900 dark:text-white">
              {{ card.value }}
            </div>
            <div class="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <span v-if="card.delta" :class="card.deltaClass">{{ card.delta }}</span>
              <span>{{ card.sub }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div class="min-w-0 flex-1">
            <Input v-model="searchQuery" type="search" :placeholder="t('accounts.filters.searchPlaceholder')"
              inputClass="border-gray-200 bg-gray-50 pl-10 dark:border-gray-700 dark:bg-gray-900">
              <template #prepend>
                <svg
                  class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </template>
            </Input>
          </div>

          <Tabs v-model="statusFilter" :options="statusFilters" variant="pills" class="w-full xl:w-auto" />
        </div>
      </section>

      <div class="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div :class="['grid items-start gap-4', activeAccount ? 'xl:grid-cols-[minmax(0,1fr)_460px]' : 'grid-cols-1']">
          <div class="min-w-0 space-y-3">
            <section
              class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
              <div class="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  <span class="text-2xl font-semibold tracking-[-0.02em] text-gray-900 dark:text-white">
                    {{ filteredAccounts.length }}
                  </span>
                  {{ t('accounts.table.accountsLabel') }}
                </div>
                <div class="font-mono text-[11px] uppercase tracking-[0.08em] text-gray-400 dark:text-gray-500">
                  {{ t('accounts.table.sortedByLastSeen') }}
                </div>
              </div>

              <div class="overflow-x-auto">
                <table class="min-w-full">
                  <thead>
                    <tr
                      class="border-b border-gray-200 bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-gray-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-gray-400">
                      <th class="w-14 px-4 py-3">
                        <Checkbox :modelValue="allSelected" class="[&>div>div]:mr-0 [&>span:last-child]:hidden"
                          @update:modelValue="toggleAll" />
                      </th>
                      <th class="px-4 py-3">{{ t('accounts.table.account') }}</th>
                      <th class="px-4 py-3">{{ t('accounts.table.role') }}</th>
                      <th class="px-4 py-3">{{ t('accounts.table.status') }}</th>
                      <th class="px-4 py-3">{{ t('accounts.table.mfa') }}</th>
                      <th class="px-4 py-3">{{ t('accounts.table.lastSeen') }}</th>
                      <th class="px-4 py-3">{{ t('accounts.table.ip') }}</th>
                      <th class="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody v-if="pagedAccounts.length">
                    <tr v-for="account in pagedAccounts" :key="account.id" :class="[
                      'group cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/5',
                      account.id === activeAccount?.id ? 'bg-brand-50/70 dark:bg-brand-500/10' : '',
                    ]" @click="selectAccount(account)">
                      <td :class="[
                        'px-4 py-4',
                        account.id === activeAccount?.id ? 'shadow-[inset_3px_0_0_0_#465fff]' : '',
                      ]" @click.stop>
                        <Checkbox :modelValue="selectedIds.includes(account.id)"
                          class="[&>div>div]:mr-0 [&>span:last-child]:hidden"
                          @update:modelValue="toggleSelected(account.id, $event)" />
                      </td>
                      <td class="px-4 py-4">
                        <div class="flex items-center gap-3">
                          <span
                            class="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                            :style="{ background: account.avatarColor }">
                            {{ initials(account.name) }}
                          </span>
                          <div class="min-w-0">
                            <div class="truncate text-sm font-medium text-gray-900 dark:text-white">{{ account.name }}
                            </div>
                            <div class="truncate text-xs text-gray-500 dark:text-gray-400">{{ account.email }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-4 py-4">
                        <Badge size="sm" :color="ROLE_DEFS[account.roleId].badgeColor" dot
                          :dotColorClass="ROLE_DEFS[account.roleId].roleDotClass">
                          {{ ROLE_DEFS[account.roleId].name }}
                        </Badge>
                      </td>
                      <td class="px-4 py-4">
                        <Badge size="sm" :color="STATUS_STYLES[account.status].badgeColor" dot
                          :dotColorClass="STATUS_STYLES[account.status].dotClass">
                          {{ account.status }}
                        </Badge>
                      </td>
                      <td class="px-4 py-4">
                        <span v-if="account.mfa"
                          class="inline-flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2.5">
                            <rect x="3" y="11" width="18" height="11" rx="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                          {{ t('accounts.table.mfaEnabled') }}
                        </span>
                        <span v-else
                          class="inline-flex items-center gap-1.5 text-xs text-error-600 dark:text-error-400">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2.5">
                            <rect x="3" y="11" width="18" height="11" rx="2" />
                            <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                            <line x1="3" y1="3" x2="21" y2="21" />
                          </svg>
                          {{ t('accounts.table.mfaDisabled') }}
                        </span>
                      </td>
                      <td class="px-4 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                        {{ relMin(account.lastSeenMin) }}
                        <span class="mt-0.5 block font-sans text-[11px] text-gray-400 dark:text-gray-500">{{
                          account.city
                          }}</span>
                      </td>
                      <td class="px-4 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">{{ account.ip }}</td>
                      <td class="px-4 py-4" @click.stop>
                        <div
                          class="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button type="button"
                            class="inline-flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                            :title="t('accounts.table.sendReset')" @click="handleSendReset([account.id])">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                              stroke-width="2">
                              <path d="M1 4v6h6" />
                              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                            </svg>
                          </button>
                          <button type="button"
                            class="inline-flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                            :title="t('accounts.table.suspend')" @click="handleSuspendAccounts([account.id])">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                              stroke-width="2">
                              <circle cx="12" cy="12" r="9" />
                              <line x1="8" y1="8" x2="16" y2="16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                  <tbody v-else>
                    <tr>
                      <td colspan="8" class="px-5 py-16">
                        <div class="text-center text-gray-500 dark:text-gray-400">
                          <div
                            class="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                              stroke-width="2">
                              <circle cx="12" cy="7" r="4" />
                              <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
                            </svg>
                          </div>
                          <div class="text-base font-semibold text-gray-700 dark:text-gray-200">
                            {{ t('accounts.table.noResults') }}
                          </div>
                          <div class="mt-1 text-sm">{{ t('accounts.table.noResultsSub') }}</div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-if="selectedIds.length"
                class="border-t border-gray-200 bg-white px-5 py-3 dark:border-gray-800 dark:bg-white/[0.03]">
                <div
                  class="flex flex-col gap-3 rounded-xl border border-gray-200 px-4 py-3 shadow-sm dark:border-gray-800 lg:flex-row lg:items-center">
                  <span class="text-sm font-semibold text-gray-900 dark:text-white">
                    {{ t('accounts.table.bulkSelected', { count: selectedIds.length }) }}
                  </span>
                  <span class="flex-1 text-sm text-gray-500 dark:text-gray-400">
                    {{ t('accounts.table.bulkAuditNote') }}
                  </span>
                  <div class="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" @click="selectedIds = []">
                      {{ t('accounts.table.clear') }}
                    </Button>
                    <Button variant="outline" size="sm" @click="handleSendReset(selectedIds)">
                      {{ t('accounts.table.sendReset') }}
                    </Button>
                    <Button variant="danger" size="sm" @click="handleSuspendAccounts(selectedIds)">
                      {{ t('accounts.table.suspend') }}
                    </Button>
                  </div>
                </div>
              </div>

              <div v-if="filteredAccounts.length" class="border-t border-gray-200 px-5 py-4 dark:border-gray-800">
                <Pagination :currentPage="currentPage" :totalPages="totalPages" :pageSize="pageSize"
                  :totalItems="filteredAccounts.length" @pageChange="currentPage = $event"
                  @pageSizeChange="handlePageSizeChange">
                  <template #summary>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {{ t('admins.showingResults', { count: pagedAccounts.length, total: filteredAccounts.length }) }}
                    </div>
                  </template>
                </Pagination>
              </div>
            </section>
          </div>

          <aside v-if="activeAccount"
            class="sticky top-[88px] flex max-h-[calc(100vh-108px)] flex-col self-start overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div class="flex items-start justify-between gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <div class="flex min-w-0 items-center gap-3">
                <span
                  class="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                  :style="{ background: activeAccount.avatarColor }">
                  {{ initials(activeAccount.name) }}
                </span>
                <div class="min-w-0">
                  <div class="truncate text-[15px] font-semibold leading-tight text-gray-900 dark:text-white">
                    {{ activeAccount.name }}
                  </div>
                  <div class="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <span class="truncate">{{ activeAccount.email }}</span>
                    <span>•</span>
                    <Badge size="sm" :color="ROLE_DEFS[activeAccount.roleId].badgeColor" dot
                      :dotColorClass="ROLE_DEFS[activeAccount.roleId].roleDotClass">
                      {{ ROLE_DEFS[activeAccount.roleId].name }}
                    </Badge>
                  </div>
                </div>
              </div>
              <button type="button"
                class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                @click="clearActiveAccount">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div class="border-b border-gray-200 px-4 dark:border-gray-800">
              <Tabs v-model="drawerTab" :options="drawerTabOptions" variant="default" />
            </div>

            <div class="flex-1 overflow-y-auto px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
              <template v-if="drawerTab === 'Overview'">
                <div>
                  <div v-for="item in activeOverviewRows" :key="item.label"
                    class="grid grid-cols-[110px_1fr] gap-3 border-b border-gray-100 py-2.5 text-[13px] last:border-b-0 dark:border-gray-800">
                    <div
                      class="pt-0.5 text-[11px] font-semibold uppercase tracking-[0.04em] text-gray-500 dark:text-gray-400">
                      {{ item.label }}
                    </div>
                    <div>
                      <Badge v-if="item.pill" size="sm" :color="item.pill.color" dot
                        :dotColorClass="item.pill.dotColorClass">
                        {{ item.pill.label }}
                      </Badge>
                      <div v-else :class="[
                        'text-[13px] text-gray-900 dark:text-white',
                        item.mono ? 'font-mono text-xs text-gray-700 dark:text-gray-300' : 'font-medium',
                      ]">
                        {{ item.value }}
                      </div>
                      <div v-if="item.subValue" class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ item.subValue
                        }}</div>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="drawerTab === 'Permissions'">
                <p class="mb-4 text-xs text-gray-500 dark:text-gray-400">
                  Permissions are inherited from
                  <span class="font-semibold text-gray-900 dark:text-white">{{ ROLE_DEFS[activeAccount.roleId].name
                    }}</span>.
                  Toggling individual permissions creates a per-account override.
                </p>
                <div class="space-y-2">
                  <div v-for="perm in ALL_PERMS" :key="perm.id"
                    class="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-3 dark:border-gray-800">
                    <div class="min-w-0">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">{{ perm.label }}</div>
                      <div class="truncate font-mono text-xs text-gray-400 dark:text-gray-500">{{ perm.id }}</div>
                    </div>
                    <ToggleSwitch :modelValue="isPermGranted(perm.id)"
                      @update:modelValue="togglePerm(perm.id, $event)" />
                  </div>
                </div>
              </template>

              <template v-else>
                <div class="space-y-0">
                  <div v-for="(event, i) in activeActivity" :key="i"
                    class="grid grid-cols-[28px_1fr_auto] items-start gap-3 border-b border-gray-100 py-3 last:border-b-0">
                    <span :class="[
                      'inline-flex h-7 w-7 items-center justify-center rounded-full',
                      ACTIVITY_DOT_CLASS[event.kind],
                    ]" v-html="ACTIVITY_ICONS[event.kind]" />
                    <div class="text-sm leading-5 text-gray-700" v-html="event.text" />
                    <div class="whitespace-nowrap font-mono text-[11px] text-gray-400">{{ event.time }}</div>
                  </div>
                </div>
              </template>
            </div>

            <div
              class="flex items-center justify-between gap-3 border-t border-gray-200 px-5 py-4 dark:border-gray-800">
              <div class="text-xs text-gray-500 dark:text-gray-400">{{ drawerFooterText }}</div>
              <div class="flex gap-2">
                <Button variant="outline" size="sm">
                  {{ t('accounts.drawer.impersonate') }}
                </Button>
                <Button v-if="activeAccount.status !== 'Suspended'" variant="danger" size="sm"
                  @click="handleSuspendAccounts([activeAccount.id])">
                  {{ t('accounts.table.suspend') }}
                </Button>
                <Button v-else size="sm" @click="handleReactivateAccount(activeAccount.id)">
                  {{ t('accounts.drawer.reactivate') }}
                </Button>
              </div>
            </div>
          </aside>
        </div>

        <aside
          class="sticky top-[88px] self-start overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div class="flex items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-gray-800">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ t('accounts.roles.title') }}
            </h3>
            <span class="font-mono text-[11px] text-gray-500 dark:text-gray-400">
              {{ t('accounts.roles.definedCount', { count: 6 }) }}
            </span>
          </div>
          <div class="p-2">
            <button v-for="role in railRoles" :key="role.id" type="button" :class="[
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
              roleFilter === role.id ? 'bg-brand-50 dark:bg-brand-500/15' : 'hover:bg-gray-50 dark:hover:bg-white/5',
            ]" @click="setRoleFilter(role.id)">
              <span :class="['h-2.5 w-2.5 flex-shrink-0 rounded-full', role.dotClass]" />
              <div class="min-w-0 flex-1">
                <div
                  :class="['text-sm font-medium', roleFilter === role.id ? 'text-brand-700 dark:text-brand-400' : 'text-gray-900 dark:text-white']">
                  {{ role.name }}
                </div>
                <div class="truncate text-[11px] text-gray-500 dark:text-gray-400">{{ role.desc }}</div>
              </div>
              <span :class="[
                'rounded-full px-2 py-0.5 font-mono text-[11px]',
                roleFilter === role.id ? 'bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
              ]">
                {{ role.count }}
              </span>
            </button>
          </div>
          <div class="border-t border-gray-200 p-4 dark:border-gray-800">
            <Button variant="outline" size="sm" className="w-full justify-center">
              <template #default>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3" />
                  <path
                    d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9 1.65 1.65 0 0 0 4.27 7.18l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                {{ t('accounts.roles.managePermissions') }}
              </template>
            </Button>
          </div>
        </aside>
      </div>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  AppShell,
  Badge,
  Button,
  Checkbox,
  Input,
  PageBreadcrumb,
  Pagination,
  Tabs,
  ToggleSwitch,
  useModal,
} from '@hivespace/shared'
import AccountsInviteModal from '@/components/accounts/AccountsInviteModal.vue'

const { t } = useI18n()

type AccountStatus = 'Active' | 'Invited' | 'Suspended' | 'Locked'
type RoleId = 'superadmin' | 'admin' | 'finance' | 'compliance' | 'risk' | 'support'

interface AccountRow {
  id: string
  name: string
  email: string
  avatarColor: string
  roleId: RoleId
  status: AccountStatus
  mfa: boolean
  lastSeenMin: number | null
  ip: string
  city: string
  createdAt: Date
}

interface DetailRow {
  label: string
  value?: string
  subValue?: string
  mono?: boolean
  pill?: { label: string; color: BadgeColor; dotColorClass: string }
}

interface ActivityEvent {
  kind: 'brand' | 'success' | 'warn' | 'error'
  text: string
  time: string
}

interface InviteModalResult {
  name: string
  email: string
  roleId: RoleId
  expiry: string
}

type BadgeColor =
  | 'primary'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark'
  | 'violet'
  | 'blue'
  | 'emerald'
  | 'amber'
  | 'fuchsia'
  | 'sky'

const { openModal } = useModal()

const COLORS = ['#465fff', '#7a5af8', '#ee46bc', '#f79009', '#0ba5ec', '#12b76a', '#fb6514', '#3641f5']

const ROLE_DEFS = computed<Record<RoleId, { name: string; desc: string; badgeColor: BadgeColor; roleDotClass: string }>>(() => ({
  superadmin: { name: t('accounts.roles.superadmin'), desc: t('accounts.roles.superadminDesc'), badgeColor: 'violet', roleDotClass: 'bg-violet-500' },
  admin: { name: t('accounts.roles.admin'), desc: t('accounts.roles.adminDesc'), badgeColor: 'blue', roleDotClass: 'bg-blue-500' },
  finance: { name: t('accounts.roles.finance'), desc: t('accounts.roles.financeDesc'), badgeColor: 'emerald', roleDotClass: 'bg-emerald-500' },
  compliance: { name: t('accounts.roles.compliance'), desc: t('accounts.roles.complianceDesc'), badgeColor: 'amber', roleDotClass: 'bg-amber-500' },
  risk: { name: t('accounts.roles.risk'), desc: t('accounts.roles.riskDesc'), badgeColor: 'fuchsia', roleDotClass: 'bg-fuchsia-500' },
  support: { name: t('accounts.roles.support'), desc: t('accounts.roles.supportDesc'), badgeColor: 'sky', roleDotClass: 'bg-sky-500' },
}))

const ROLE_DOT_CLASSES: Record<RoleId | 'all', string> = {
  all: 'bg-gray-400',
  superadmin: 'bg-violet-500',
  admin: 'bg-brand-500',
  finance: 'bg-emerald-500',
  compliance: 'bg-amber-500',
  risk: 'bg-fuchsia-500',
  support: 'bg-sky-500',
}

const STATUS_STYLES: Record<AccountStatus, { badgeColor: BadgeColor; dotClass: string }> = {
  Active: { badgeColor: 'success', dotClass: 'bg-success-500' },
  Invited: { badgeColor: 'sky', dotClass: 'bg-sky-500' },
  Suspended: { badgeColor: 'error', dotClass: 'bg-error-500' },
  Locked: { badgeColor: 'warning', dotClass: 'bg-warning-500' },
}

const ALL_PERMS = computed(() => [
  { id: 'accounts.read', label: t('accounts.permissions.read') },
  { id: 'accounts.write', label: t('accounts.permissions.write') },
  { id: 'merchants.suspend', label: t('accounts.permissions.merchantsSuspend') },
  { id: 'payments.refund', label: t('accounts.permissions.paymentsRefund') },
  { id: 'config.write', label: t('accounts.permissions.configWrite') },
  { id: 'audit.export', label: t('accounts.permissions.auditExport') },
  { id: 'kyb.approve', label: t('accounts.permissions.kybApprove') },
  { id: 'risk.rules', label: t('accounts.permissions.riskRules') },
])

const ROLE_PERMS: Record<RoleId, string[]> = {
  superadmin: ['accounts.read', 'accounts.write', 'merchants.suspend', 'payments.refund', 'config.write', 'audit.export', 'kyb.approve', 'risk.rules'],
  admin: ['accounts.read', 'accounts.write', 'merchants.suspend', 'config.write', 'audit.export'],
  finance: ['accounts.read', 'payments.refund', 'audit.export'],
  compliance: ['accounts.read', 'kyb.approve', 'audit.export'],
  risk: ['accounts.read', 'merchants.suspend', 'risk.rules', 'audit.export'],
  support: ['accounts.read'],
}

const ACTIVITY_ICONS: Record<ActivityEvent['kind'], string> = {
  brand: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  success: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
  warn: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>',
  error: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
}

const ACTIVITY_DOT_CLASS: Record<ActivityEvent['kind'], string> = {
  brand: 'bg-brand-50 text-brand-600',
  success: 'bg-success-50 text-success-600',
  warn: 'bg-warning-50 text-warning-600',
  error: 'bg-error-50 text-error-600',
}

const relMin = (min: number | null): string => {
  if (min == null) return '—'
  if (min < 1) return t('common.justNow')
  if (min < 60) return t('common.ago', { value: min, unit: 'm' })
  if (min < 60 * 24) return t('common.ago', { value: Math.floor(min / 60), unit: 'h' })
  return t('common.ago', { value: Math.floor(min / (60 * 24)), unit: 'd' })
}

const fmtDate = (d: Date): string => {
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()}`
}

const initials = (name: string): string =>
  name.split(' ').filter(Boolean).slice(-2).map((s) => s[0]).join('').toUpperCase()

const accounts = ref<AccountRow[]>([
  { id: 'u_anhtuan', name: 'Nguyễn Anh Tuấn', email: 'anhtuan@hivespace.vn', avatarColor: COLORS[0], roleId: 'superadmin', status: 'Active', mfa: true, lastSeenMin: 3, ip: '113.160.92.14', city: 'Hà Nội', createdAt: new Date('2026-05-05') },
  { id: 'u_thumai', name: 'Trần Thu Mai', email: 'thumai@hivespace.vn', avatarColor: COLORS[1], roleId: 'compliance', status: 'Active', mfa: true, lastSeenMin: 60, ip: '14.241.180.22', city: 'Hà Nội', createdAt: new Date('2026-04-18') },
  { id: 'u_quochuy', name: 'Phạm Quốc Huy', email: 'quochuy@hivespace.vn', avatarColor: COLORS[2], roleId: 'finance', status: 'Active', mfa: true, lastSeenMin: 18, ip: '171.224.45.7', city: 'TP. Hồ Chí Minh', createdAt: new Date('2026-04-01') },
  { id: 'u_honghai', name: 'Lê Hồng Hải', email: 'honghai@hivespace.vn', avatarColor: COLORS[3], roleId: 'risk', status: 'Active', mfa: true, lastSeenMin: 45, ip: '125.235.18.91', city: 'Đà Nẵng', createdAt: new Date('2026-03-15') },
  { id: 'u_dinhbao', name: 'Vũ Đình Bảo', email: 'dinhbao@hivespace.vn', avatarColor: COLORS[4], roleId: 'admin', status: 'Active', mfa: true, lastSeenMin: 12, ip: '113.160.92.14', city: 'Hà Nội', createdAt: new Date('2026-02-26') },
  { id: 'u_thuhang', name: 'Đặng Thu Hằng', email: 'thuhang@hivespace.vn', avatarColor: COLORS[5], roleId: 'support', status: 'Active', mfa: true, lastSeenMin: 120, ip: '203.205.77.14', city: 'TP. Hồ Chí Minh', createdAt: new Date('2026-02-09') },
  { id: 'u_minhanh', name: 'Bùi Minh Anh', email: 'minhanh@hivespace.vn', avatarColor: COLORS[6], roleId: 'support', status: 'Active', mfa: false, lastSeenMin: 240, ip: '210.245.32.150', city: 'Hải Phòng', createdAt: new Date('2026-01-23') },
  { id: 'u_quynhmy', name: 'Hoàng Quỳnh My', email: 'quynhmy@hivespace.vn', avatarColor: COLORS[7], roleId: 'finance', status: 'Active', mfa: true, lastSeenMin: 300, ip: '171.224.45.7', city: 'TP. Hồ Chí Minh', createdAt: new Date('2026-01-06') },
  { id: 'u_levanthang', name: 'Lê Văn Thắng', email: 'levanthang@hivespace.vn', avatarColor: COLORS[0], roleId: 'admin', status: 'Invited', mfa: false, lastSeenMin: null, ip: '—', city: '—', createdAt: new Date('2025-12-20') },
  { id: 'u_phamquynh', name: 'Phạm Quỳnh Trang', email: 'phamquynh@hivespace.vn', avatarColor: COLORS[1], roleId: 'compliance', status: 'Invited', mfa: false, lastSeenMin: null, ip: '—', city: '—', createdAt: new Date('2025-12-03') },
  { id: 'u_nguyenthihoa', name: 'Nguyễn Thị Hoa', email: 'nguyenthihoa@hivespace.vn', avatarColor: COLORS[2], roleId: 'support', status: 'Active', mfa: true, lastSeenMin: 480, ip: '125.235.18.91', city: 'Cần Thơ', createdAt: new Date('2025-11-16') },
  { id: 'u_dangtan', name: 'Đặng Tấn Dũng', email: 'dangtan@hivespace.vn', avatarColor: COLORS[3], roleId: 'risk', status: 'Locked', mfa: true, lastSeenMin: 2160, ip: '113.160.92.14', city: 'Hà Nội', createdAt: new Date('2025-10-30') },
  { id: 'u_truongmai', name: 'Trương Hoàng Mai', email: 'truongmai@hivespace.vn', avatarColor: COLORS[4], roleId: 'support', status: 'Active', mfa: true, lastSeenMin: 90, ip: '210.245.32.150', city: 'Đà Nẵng', createdAt: new Date('2025-10-13') },
  { id: 'u_dovanlam', name: 'Đỗ Văn Lâm', email: 'dovanlam@hivespace.vn', avatarColor: COLORS[5], roleId: 'finance', status: 'Active', mfa: true, lastSeenMin: 6, ip: '171.224.45.7', city: 'TP. Hồ Chí Minh', createdAt: new Date('2025-09-26') },
  { id: 'u_nghiemha', name: 'Nghiêm Hà Linh', email: 'nghiemha@hivespace.vn', avatarColor: COLORS[6], roleId: 'admin', status: 'Suspended', mfa: false, lastSeenMin: 12960, ip: '203.205.77.14', city: 'Hà Nội', createdAt: new Date('2025-09-09') },
  { id: 'u_phamlong', name: 'Phạm Hữu Long', email: 'phamlong@hivespace.vn', avatarColor: COLORS[7], roleId: 'compliance', status: 'Active', mfa: true, lastSeenMin: 15, ip: '14.241.180.22', city: 'Hà Nội', createdAt: new Date('2025-08-23') },
  { id: 'u_buihai', name: 'Bùi Đình Hải', email: 'buihai@hivespace.vn', avatarColor: COLORS[0], roleId: 'support', status: 'Active', mfa: true, lastSeenMin: 300, ip: '210.245.32.150', city: 'Hải Phòng', createdAt: new Date('2025-08-06') },
  { id: 'u_caongoc', name: 'Cao Bích Ngọc', email: 'caongoc@hivespace.vn', avatarColor: COLORS[1], roleId: 'admin', status: 'Active', mfa: true, lastSeenMin: 10, ip: '203.205.77.14', city: 'TP. Hồ Chí Minh', createdAt: new Date('2025-07-20') },
  { id: 'u_tranminh', name: 'Trần Hoàng Minh', email: 'tranminh@hivespace.vn', avatarColor: COLORS[2], roleId: 'support', status: 'Invited', mfa: false, lastSeenMin: null, ip: '—', city: '—', createdAt: new Date('2025-07-03') },
  { id: 'u_lyngoc', name: 'Lý Bảo Ngọc', email: 'lyngoc@hivespace.vn', avatarColor: COLORS[3], roleId: 'finance', status: 'Active', mfa: true, lastSeenMin: 240, ip: '125.235.18.91', city: 'Đà Nẵng', createdAt: new Date('2025-06-16') },
  { id: 'u_vutuan', name: 'Vũ Anh Tuấn', email: 'vutuan@hivespace.vn', avatarColor: COLORS[4], roleId: 'risk', status: 'Active', mfa: true, lastSeenMin: 35, ip: '14.241.180.22', city: 'Hà Nội', createdAt: new Date('2025-05-30') },
  { id: 'u_phantai', name: 'Phan Đức Tài', email: 'phantai@hivespace.vn', avatarColor: COLORS[5], roleId: 'support', status: 'Active', mfa: true, lastSeenMin: 240, ip: '171.224.45.7', city: 'TP. Hồ Chí Minh', createdAt: new Date('2025-05-13') },
  { id: 'u_dolan', name: 'Đỗ Hương Lan', email: 'dolan@hivespace.vn', avatarColor: COLORS[6], roleId: 'compliance', status: 'Active', mfa: true, lastSeenMin: 20, ip: '125.235.18.91', city: 'Cần Thơ', createdAt: new Date('2025-04-26') },
  { id: 'u_kieuminh', name: 'Kiều Tuấn Minh', email: 'kieuminh@hivespace.vn', avatarColor: COLORS[7], roleId: 'admin', status: 'Active', mfa: true, lastSeenMin: 90, ip: '113.160.92.14', city: 'Hà Nội', createdAt: new Date('2025-04-09') },
  { id: 'u_huynhmai', name: 'Huỳnh Phương Mai', email: 'huynhmai@hivespace.vn', avatarColor: COLORS[0], roleId: 'support', status: 'Locked', mfa: true, lastSeenMin: 2880, ip: '210.245.32.150', city: 'Hải Phòng', createdAt: new Date('2025-03-23') },
])

const statusFilters: { value: AccountStatus | 'all'; label: string }[] = [
  { value: 'all', label: t('accounts.filters.all') },
  { value: 'Active', label: t('accounts.filters.active') },
  { value: 'Invited', label: t('accounts.filters.invited') },
  { value: 'Suspended', label: t('accounts.filters.suspended') },
  { value: 'Locked', label: t('accounts.filters.locked') },
]

const drawerTabOptions = computed(() => [
  { label: t('accounts.drawer.overview'), value: 'Overview' },
  { label: t('accounts.drawer.permissions'), value: 'Permissions' },
  { label: t('accounts.drawer.activity'), value: 'Activity' },
])

const roleOptions = [
  { value: 'support', label: t('accounts.roles.support') },
  { value: 'finance', label: t('accounts.roles.finance') },
  { value: 'compliance', label: t('accounts.roles.compliance') },
  { value: 'risk', label: t('accounts.roles.risk') },
  { value: 'admin', label: t('accounts.roles.admin') },
  { value: 'superadmin', label: t('accounts.roles.superadmin') },
]

const expiryOptions = [
  { value: '24h', label: '24 hours' },
  { value: '3d', label: '3 days' },
  { value: '7d', label: '7 days' },
]

const searchQuery = ref('')
const statusFilter = ref<AccountStatus | 'all'>('all')
const roleFilter = ref<RoleId | 'all'>('all')
const selectedIds = ref<string[]>([])
const activeAccountId = ref<string | null>(null)
const drawerTab = ref('Overview')
const currentPage = ref(1)
const pageSize = ref(10)
const permOverrides = ref<Record<string, Record<string, boolean>>>({})

const filteredAccounts = computed(() => {
  return accounts.value.filter((account) => {
    if (roleFilter.value !== 'all' && account.roleId !== roleFilter.value) return false
    if (statusFilter.value !== 'all' && account.status !== statusFilter.value) return false
    if (!searchQuery.value) return true

    const q = searchQuery.value.toLowerCase()
    return [account.name, account.email, account.city, account.ip, ROLE_DEFS.value[account.roleId].name]
      .some((value) => value.toLowerCase().includes(q))
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredAccounts.value.length / pageSize.value)))

const pagedAccounts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredAccounts.value.slice(start, start + pageSize.value)
})

const activeAccount = computed(
  () => accounts.value.find((account) => account.id === activeAccountId.value) ?? null,
)

const allSelected = computed(
  () =>
    pagedAccounts.value.length > 0 &&
    pagedAccounts.value.every((account) => selectedIds.value.includes(account.id)),
)

const statCards = computed(() => [
  {
    label: t('accounts.stats.total'),
    value: String(accounts.value.length),
    delta: '+3',
    deltaClass: 'font-semibold text-success-600',
    sub: t('accounts.stats.thisMonth'),
    iconBg: 'bg-brand-50',
    iconColor: 'text-brand-600',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
  },
  {
    label: t('accounts.stats.active'),
    value: String(accounts.value.filter((account) => account.status === 'Active').length),
    sub: t('accounts.stats.signedInLast30d'),
    iconBg: 'bg-success-50',
    iconColor: 'text-success-600',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
  },
  {
    label: t('accounts.stats.pendingInvites'),
    value: String(accounts.value.filter((account) => account.status === 'Invited').length),
    sub: t('accounts.stats.awaitingFirstLogin'),
    iconBg: 'bg-warning-50',
    iconColor: 'text-warning-600',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
  },
  {
    label: t('accounts.stats.needsAttention'),
    value: String(
      accounts.value.filter((account) => account.status === 'Suspended' || account.status === 'Locked' || !account.mfa).length,
    ),
    sub: t('accounts.stats.attentionSub'),
    iconBg: 'bg-error-50',
    iconColor: 'text-error-600',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>',
  },
])

const railRoles = computed(() => [
  {
    id: 'all' as const,
    name: t('accounts.roles.all'),
    desc: t('accounts.roles.allDesc'),
    count: accounts.value.length,
    dotClass: ROLE_DOT_CLASSES.all,
  },
  ...(['superadmin', 'admin', 'finance', 'compliance', 'risk', 'support'] as RoleId[]).map((id) => ({
    id,
    name: ROLE_DEFS.value[id].name,
    desc: ROLE_DEFS.value[id].desc,
    count: accounts.value.filter((account) => account.roleId === id).length,
    dotClass: ROLE_DOT_CLASSES[id],
  })),
])

const activeOverviewRows = computed<DetailRow[]>(() => {
  const account = activeAccount.value
  if (!account) return []

  const role = ROLE_DEFS.value[account.roleId]
  const status = STATUS_STYLES[account.status]

  return [
    { label: t('accounts.table.status'), pill: { label: account.status, color: status.badgeColor, dotColorClass: status.dotClass } },
    { label: t('accounts.drawer.accountId'), value: account.id, mono: true },
    { label: t('accounts.drawer.email'), value: account.email },
    { label: t('accounts.table.role'), pill: { label: role.name, color: role.badgeColor, dotColorClass: role.roleDotClass }, subValue: role.desc },
    { label: t('accounts.drawer.mfa'), value: account.mfa ? t('accounts.drawer.mfaEnabled') : t('accounts.drawer.mfaDisabled') },
    { label: t('accounts.drawer.lastSeen'), value: `${relMin(account.lastSeenMin)} · ${account.city}` },
    { label: t('accounts.drawer.lastIp'), value: account.ip, mono: true },
    { label: t('accounts.drawer.memberSince'), value: fmtDate(account.createdAt) },
  ]
})

const activeActivity = computed<ActivityEvent[]>(() => {
  const account = activeAccount.value
  if (!account) return []

  const role = ROLE_DEFS.value[account.roleId]
  const events: ActivityEvent[] = []

  if (account.status === 'Invited') {
    events.push({ kind: 'brand', text: `Invited as <b>${role.name}</b> by Nguyễn Anh Tuấn`, time: '2d ago' })
    return events
  }

  events.push({ kind: 'brand', text: `Signed in from <b>${account.city}</b> · ${account.ip}`, time: relMin(account.lastSeenMin) })
  if (account.roleId === 'finance') events.push({ kind: 'success', text: 'Approved <b>14 payouts</b> totaling ₫512.300.000', time: '2h ago' })
  if (account.roleId === 'compliance') events.push({ kind: 'success', text: 'Approved KYB for <b>Mỹ Phẩm Sài Gòn</b>', time: '5h ago' })
  if (account.roleId === 'risk') events.push({ kind: 'warn', text: 'Suspended merchant <b>Shop Hoa Anh Đào</b> (fraud signals)', time: '1d ago' })
  if (account.roleId === 'admin') events.push({ kind: 'brand', text: 'Updated platform commission to <b>5.2%</b>', time: '1d ago' })
  if (!account.mfa) events.push({ kind: 'error', text: '<b>2FA disabled</b> — flagged for follow-up by security', time: '3d ago' })
  if (account.status === 'Locked') events.push({ kind: 'error', text: 'Auto-locked after <b>5 failed sign-in attempts</b>', time: relMin(account.lastSeenMin) })

  events.push({ kind: 'brand', text: 'Account created', time: fmtDate(account.createdAt) })
  return events
})

const drawerFooterText = computed(() => {
  switch (activeAccount.value?.status) {
    case 'Active':
      return t('accounts.drawer.statusGood')
    case 'Invited':
      return t('accounts.drawer.statusInvited')
    case 'Locked':
      return t('accounts.drawer.statusLocked')
    case 'Suspended':
      return t('accounts.drawer.statusSuspended')
    default:
      return ''
  }
})

watch([searchQuery, statusFilter, roleFilter, pageSize], () => {
  currentPage.value = 1
  selectedIds.value = []
})

watch(filteredAccounts, (items) => {
  if (activeAccountId.value && !items.some((account) => account.id === activeAccountId.value)) {
    activeAccountId.value = null
  }
})

const toggleSelected = (id: string, checked: boolean) => {
  if (checked) {
    if (!selectedIds.value.includes(id)) selectedIds.value = [...selectedIds.value, id]
    return
  }

  selectedIds.value = selectedIds.value.filter((value) => value !== id)
}

const toggleAll = (checked: boolean) => {
  selectedIds.value = checked ? pagedAccounts.value.map((account) => account.id) : []
}

const selectAccount = (account: AccountRow) => {
  activeAccountId.value = account.id
  drawerTab.value = 'Overview'
}

const clearActiveAccount = () => {
  activeAccountId.value = null
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const setRoleFilter = (id: RoleId | 'all') => {
  roleFilter.value = id
}

const updateAccountStatus = (ids: string[], status: AccountStatus) => {
  const idSet = new Set(ids)
  accounts.value = accounts.value.map((account) => {
    if (!idSet.has(account.id)) return account
    return { ...account, status }
  })
}

const handleSendReset = (_ids: string[]) => {
  selectedIds.value = []
}

const handleSuspendAccounts = (ids: string[]) => {
  updateAccountStatus(ids, 'Suspended')
  selectedIds.value = selectedIds.value.filter((id) => !ids.includes(id))
}

const handleReactivateAccount = (id: string) => {
  updateAccountStatus([id], 'Active')
}

const isPermGranted = (permId: string): boolean => {
  const account = activeAccount.value
  if (!account) return false

  const overrides = permOverrides.value[account.id] ?? {}
  if (permId in overrides) return overrides[permId]
  return ROLE_PERMS[account.roleId].includes(permId)
}

const togglePerm = (permId: string, checked: boolean) => {
  const account = activeAccount.value
  if (!account) return

  permOverrides.value = {
    ...permOverrides.value,
    [account.id]: {
      ...(permOverrides.value[account.id] ?? {}),
      [permId]: checked,
    },
  }
}

const handleInviteAdmin = async () => {
  const result = await openModal<InviteModalResult>(AccountsInviteModal, {
    title: t('accounts.inviteModal.title'),
    description: t('accounts.inviteModal.description'),
    maxWidth: '640px',
    roleOptions,
    expiryOptions,
  })

  if (!result) return

  const nextColor = COLORS[accounts.value.length % COLORS.length]
  const newAccount: AccountRow = {
    id: `u_${Date.now()}`,
    name: result.name,
    email: result.email,
    avatarColor: nextColor,
    roleId: result.roleId,
    status: 'Invited',
    mfa: false,
    lastSeenMin: null,
    ip: '—',
    city: '—',
    createdAt: new Date(),
  }

  accounts.value = [newAccount, ...accounts.value]
  activeAccountId.value = newAccount.id
  drawerTab.value = 'Overview'
}
</script>
