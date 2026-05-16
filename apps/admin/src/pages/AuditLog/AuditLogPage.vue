<template>
  <AppShell>
    <PageBreadcrumb :pageTitle="t('auditLog.title')">
      <p class="mt-1 max-w-3xl text-sm text-gray-500 dark:text-gray-400">
        {{ t('auditLog.description') }}
      </p>
    </PageBreadcrumb>

    <div class="mb-4 mt-4 flex flex-wrap items-center justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2 rounded-full border-success-200 bg-success-50 text-success-700 hover:bg-success-50 dark:border-success-800 dark:bg-success-500/15 dark:text-success-400"
        @click="live = !live"
      >
        <span class="h-2 w-2 rounded-full" :class="live ? 'bg-success-500' : 'bg-gray-400'"></span>
        {{ t('auditLog.actions.live') }}
      </Button>
      <Button variant="outline" size="sm" className="gap-2" @click="exportOpen = true">
        {{ t('auditLog.actions.export') }}
      </Button>
      <Button variant="primary-outline" size="sm" className="gap-2">
        {{ t('auditLog.actions.savedViews') }}
      </Button>
    </div>

    <div class="space-y-5 pb-6">
      <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="card in statCards"
          :key="card.label"
          class="relative rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
        >
          <div class="text-sm text-gray-500 dark:text-gray-400">{{ card.label }}</div>
          <div class="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{{ card.value }}</div>
          <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ card.sub }}</div>
          <div
            :class="[
              'absolute right-5 top-5 inline-flex h-8 w-8 items-center justify-center rounded-full',
              card.iconBg,
            ]"
          >
            <span :class="card.iconColor" v-html="card.icon"></span>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div class="text-sm font-semibold text-gray-900 dark:text-white">{{ t('auditLog.density.title') }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">{{ t('auditLog.density.subtitle') }}</div>
          </div>
          <div class="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span class="inline-flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-blue-500"></span> {{ t('auditLog.density.activity') }}
            </span>
            <span class="inline-flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-blue-200"></span> {{ t('auditLog.density.selectedRange') }}
            </span>
            <span class="inline-flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-red-500"></span> {{ t('auditLog.density.criticalPresent') }}
            </span>
          </div>
        </div>
        <div class="grid h-36 grid-cols-12 items-end gap-2">
          <button
            v-for="bar in densityBars"
            :key="bar.hour"
            type="button"
            class="group flex h-full items-end"
            @click="selectedBar = bar.hour"
          >
            <span
              class="w-full rounded-t-md transition-all group-hover:opacity-90"
              :class="bar.critical ? 'bg-red-400' : selectedBar === bar.hour ? 'bg-blue-300' : 'bg-blue-500'"
              :style="{ height: `${bar.value}%` }"
            />
          </button>
        </div>
        <div class="mt-3 grid grid-cols-12 text-center text-[11px] text-gray-400 dark:text-gray-500">
          <span v-for="bar in densityBars" :key="`${bar.hour}-axis`">{{ bar.hour }}</span>
        </div>
      </div>

      <section class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="flex flex-col gap-3">
          <!-- controls row -->
          <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:gap-3">
            <div class="xl:min-w-0 xl:flex-[0_1_320px]">
              <Input
                v-model="searchQuery"
                :placeholder="t('auditLog.filters.searchPlaceholder')"
                inputClass="border-gray-200 bg-gray-50 pl-11 dark:border-gray-700 dark:bg-gray-900"
                class="w-full"
              >
                <template #prepend>
                  <svg
                    class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </template>
              </Input>
            </div>

            <div class="inline-flex rounded-xl bg-gray-100 p-1 dark:bg-gray-900 xl:shrink-0">
              <button
                v-for="range in timeRanges"
                :key="range"
                type="button"
                @click="activeTimeRange = range"
                :class="[
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  activeTimeRange === range
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
                ]"
              >
                {{ range }}
              </button>
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:min-w-0 xl:flex-[1_1_auto] xl:grid-cols-3">
              <div class="relative">
                <MultipleSelect
                  v-model="surfaceFilter"
                  :options="surfaceOptions"
                  :label="t('auditLog.filters.surface')"
                  variant="filter"
                >
                  <template #icon>
                    <GridIcon class="w-4 h-4" />
                  </template>
                </MultipleSelect>
              </div>

              <div class="relative">
                <MultipleSelect
                  v-model="severityFilter"
                  :options="severityOptions"
                  :label="t('auditLog.filters.severity')"
                  variant="filter"
                >
                  <template #icon>
                    <WarningIcon class="w-4 h-4" />
                  </template>
                </MultipleSelect>
              </div>

              <div class="relative">
                <MultipleSelect
                  v-model="actorFilter"
                  :options="actorOptions"
                  :label="t('auditLog.filters.actor')"
                  variant="filter"
                >
                  <template #icon>
                    <UserCircleIcon class="w-4 h-4" />
                  </template>
                </MultipleSelect>
              </div>
            </div>

            <div class="inline-flex w-full rounded-xl border border-gray-200 bg-gray-100 p-1 dark:border-gray-800 dark:bg-gray-900 xl:w-auto xl:shrink-0">
              <button
                v-for="option in viewModeOptions"
                :key="option.value"
                type="button"
                @click="viewMode = option.value"
                :class="[
                  'inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors xl:flex-none',
                  viewMode === option.value
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
                ]"
              >
                <svg
                  v-if="option.value === 'table'"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M4 6h16" />
                  <path d="M4 12h16" />
                  <path d="M4 18h16" />
                </svg>
                <svg
                  v-else
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 3" />
                </svg>
                {{ option.label }}
              </button>
            </div>
          </div>

          <!-- active-filter chip row -->
          <div v-if="activeChips.length > 0" class="flex flex-wrap items-center gap-2">
            <span
              v-for="chip in activeChips"
              :key="chip.key"
              class="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-500/10 dark:text-brand-300"
            >
              {{ chip.label }}
              <button
                type="button"
                class="ml-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-brand-400 transition hover:text-brand-600 dark:text-brand-500 dark:hover:text-brand-200"
                @click="removeChip(chip)"
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </span>
            <button
              type="button"
              class="text-xs font-medium text-gray-400 transition hover:text-brand-600 dark:text-gray-500 dark:hover:text-brand-400"
              @click="clearAllFilters"
            >
              {{ t('auditLog.filters.clearAll') }}
            </button>
          </div>
        </div>
      </section>

      <div :class="['grid grid-cols-1 items-start gap-4', activeEntry ? 'xl:grid-cols-[minmax(0,1fr)_440px]' : '']">
        <section class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div class="min-w-0">
            <template v-if="viewMode === 'table'">
              <div class="flex items-center justify-between border-b border-gray-200 px-5 py-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <div>{{ t('auditLog.totalResults', { count: filteredEntries.length, total: entries.length }) }}</div>
                <div class="inline-flex items-center gap-2 text-xs">
                  <span class="h-1.5 w-1.5 rounded-full" :class="live ? 'bg-success-500' : 'bg-gray-400'"></span>
                  <span>{{ live ? t('auditLog.actions.streaming') : t('auditLog.actions.paused') }}</span>
                  <span class="font-mono opacity-70">· {{ t('auditLog.actions.refreshNote') }}</span>
                </div>
              </div>
              <div class="overflow-x-auto">
                <table class="min-w-full">
                  <thead>
                    <tr class="border-b border-gray-200 bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-gray-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-gray-400">
                      <th class="px-5 py-3">{{ t('auditLog.columns.time') }}</th>
                      <th class="px-5 py-3">{{ t('auditLog.columns.actor') }}</th>
                      <th class="px-5 py-3">{{ t('auditLog.columns.action') }}</th>
                      <th class="px-5 py-3">{{ t('auditLog.columns.surface') }}</th>
                      <th class="px-5 py-3">{{ t('auditLog.columns.severity') }}</th>
                      <th class="px-5 py-3">{{ t('auditLog.columns.ip') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="entry in pagedEntries"
                      :key="entry.id"
                      :class="[
                        'cursor-pointer border-b border-gray-100 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/5',
                        activeEntry?.id === entry.id
                          ? 'bg-blue-50/80 shadow-[inset_3px_0_0_0_rgb(37,99,235)] dark:bg-brand-500/10'
                          : '',
                        newEntryIds.has(entry.id) ? 'is-new' : '',
                      ]"
                      @click="openEntry(entry)"
                    >
                      <td class="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <div class="font-mono">{{ entry.time }}</div>
                        <div class="mt-1 text-xs text-gray-400 dark:text-gray-500">{{ entry.relativeTime }}</div>
                      </td>
                      <td class="px-5 py-4">
                        <div class="flex items-center gap-3">
                          <span
                            class="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full text-[11px] font-semibold text-white"
                            :style="{ backgroundColor: entry.actorColor }"
                          >
                            {{ entry.actorInitials }}
                          </span>
                          <div class="min-w-0">
                            <div class="truncate font-medium text-gray-900 dark:text-white">{{ entry.actor }}</div>
                            <div class="truncate text-xs text-gray-500 dark:text-gray-400">{{ entry.actorType }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-5 py-4">
                        <div class="font-medium text-gray-900 dark:text-white">{{ entry.action }}</div>
                        <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ entry.eventTitle }}</div>
                      </td>
                      <td class="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {{ entry.surface }}
                      </td>
                      <td class="px-5 py-4">
                        <Badge
                          size="sm"
                          :color="severityStyles[entry.severity].color"
                          dot
                          :dotColorClass="severityStyles[entry.severity].dotClass"
                        >
                          {{ entry.severity }}
                        </Badge>
                      </td>
                      <td class="px-5 py-4 font-mono text-sm text-gray-500 dark:text-gray-400">{{ entry.ip }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="border-t border-gray-200 px-5 py-4 dark:border-gray-800">
                <Pagination
                  :currentPage="currentPage"
                  :totalPages="totalPages"
                  :pageSize="pageSize"
                  :totalItems="filteredEntries.length"
                  @pageChange="currentPage = $event"
                  @pageSizeChange="handlePageSizeChange"
                >
                  <template #summary>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {{ t('auditLog.results', { count: pagedEntries.length }) }}
                    </div>
                  </template>
                </Pagination>
              </div>
            </template>

            <template v-else>
              <div class="space-y-4 p-5">
                <div
                  v-for="entry in filteredEntries"
                  :key="`${entry.id}-timeline`"
                  :class="[
                    'relative cursor-pointer rounded-lg border-l-2 pl-5 transition dark:border-gray-700',
                    activeEntry?.id === entry.id
                      ? 'border-blue-500 bg-blue-50/70 dark:bg-brand-500/10'
                      : 'border-gray-200 hover:bg-gray-50 dark:hover:bg-white/5',
                  ]"
                  @click="openEntry(entry)"
                >
                  <span
                    class="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full"
                    :class="severityStyles[entry.severity].dotClass"
                  ></span>
                  <div class="text-xs text-gray-400 dark:text-gray-500">{{ entry.time }}</div>
                  <div class="mt-1 font-medium text-gray-900 dark:text-white">{{ entry.eventTitle }}</div>
                  <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {{ entry.actor }} · {{ entry.surface }} · {{ entry.resource.id }}
                  </div>
                </div>
              </div>
            </template>
          </div>
        </section>

        <aside
          v-if="activeEntry"
          class="sticky top-[88px] flex max-h-[calc(100vh-108px)] flex-col self-start overflow-hidden rounded-xl border border-gray-200 bg-white opacity-100 transition dark:border-gray-800 dark:bg-[#1a2231]"
        >
          <div class="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4 dark:border-gray-800">
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <Badge
                  size="sm"
                  :color="severityStyles[activeEntry.severity].color"
                  dot
                  :dotColorClass="severityStyles[activeEntry.severity].dotClass"
                >
                  {{ activeEntry.severity }}
                </Badge>
                <div class="truncate text-base font-semibold text-gray-900 dark:text-white">
                  {{ activeEntry.action }}
                </div>
              </div>
              <div class="mt-1 font-mono text-xs text-gray-500 dark:text-gray-400">
                {{ activeEntry.id }} · {{ activeEntry.fullTimestamp }}
              </div>
            </div>
            <button
              type="button"
              class="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
              @click="closeDrawer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div class="border-b border-gray-200 px-4 dark:border-gray-800">
            <div class="flex gap-1">
              <button
                v-for="tab in drawerTabs"
                :key="tab.value"
                type="button"
                class="border-b-2 px-3 py-3 text-sm font-medium transition-colors"
                :class="
                  drawerTab === tab.value
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white'
                "
                @click="drawerTab = tab.value"
              >
                {{ tab.label }}
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
            <template v-if="drawerTab === 'Overview'">
              <div class="border-b border-gray-100 pb-4 dark:border-white/5">
                <div class="flex items-center gap-3">
                  <span
                    class="inline-flex h-10 w-10 flex-none items-center justify-center rounded-full text-sm font-semibold text-white"
                    :style="{ backgroundColor: activeEntry.actorColor }"
                  >
                    {{ activeEntry.actorInitials }}
                  </span>
                  <div class="min-w-0">
                    <div class="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {{ activeEntry.actor }}
                    </div>
                    <div class="truncate text-xs text-gray-500 dark:text-gray-400">
                      {{ activeEntry.actorType }} · {{ activeEntry.actorEmail }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="pt-2">
                <div v-for="row in overviewRows" :key="row.label" class="grid grid-cols-[100px_minmax(0,1fr)] gap-3 border-b border-gray-100 py-3 last:border-b-0 dark:border-white/5">
                  <div class="text-[11px] font-semibold uppercase tracking-[0.04em] text-gray-500 dark:text-gray-400">
                    {{ row.label }}
                  </div>
                  <div class="min-w-0 text-sm text-gray-900 dark:text-white">
                    <template v-if="row.type === 'surface'">
                      <span class="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-white/5 dark:text-gray-200">
                        <span
                          class="h-1.5 w-1.5 rounded-full"
                          :class="surfaceDotClasses[activeEntry.surface]"
                        ></span>
                        {{ activeEntry.surface }}
                      </span>
                    </template>
                    <template v-else-if="row.type === 'resource'">
                      <div class="font-medium">{{ activeEntry.resource.label }}</div>
                      <div class="mt-1 font-mono text-xs text-gray-500 dark:text-gray-400">
                        {{ activeEntry.resource.type }} · {{ activeEntry.resource.id }}
                      </div>
                    </template>
                    <template v-else-if="row.type === 'ip'">
                      <div class="font-mono text-xs text-gray-700 dark:text-gray-200">{{ activeEntry.ip }}</div>
                      <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ activeEntry.city }}</div>
                    </template>
                    <template v-else-if="row.type === 'user-agent'">
                      <div class="break-words font-mono text-xs text-gray-500 dark:text-gray-400">
                        {{ activeEntry.userAgent }}
                      </div>
                    </template>
                    <template v-else>
                      {{ row.value }}
                    </template>
                  </div>
                </div>
              </div>
            </template>

            <template v-else-if="drawerTab === 'Diff'">
              <div v-if="activeEntry.diff.length" class="overflow-hidden rounded-lg border border-gray-200 dark:border-white/10">
                <div
                  v-for="(change, index) in activeEntry.diff"
                  :key="`${change.field}-${index}`"
                  class="border-b border-gray-200 last:border-b-0 dark:border-white/10"
                >
                  <div class="flex gap-3 bg-red-50 px-4 py-2 font-mono text-xs text-red-700 dark:bg-red-500/10 dark:text-red-200">
                    <span class="w-3 flex-none text-gray-400">-</span>
                    <span><b>{{ change.field }}</b>: {{ change.before }}</span>
                  </div>
                  <div class="flex gap-3 bg-green-50 px-4 py-2 font-mono text-xs text-green-700 dark:bg-green-500/10 dark:text-green-200">
                    <span class="w-3 flex-none text-gray-400">+</span>
                    <span><b>{{ change.field }}</b>: {{ change.after }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="py-10 text-center">
                <div class="text-base font-semibold text-gray-700 dark:text-white">{{ t('auditLog.drawer.noDiff') }}</div>
                <div class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {{ t('auditLog.drawer.noDiffSub') }}
                </div>
              </div>
            </template>

            <template v-else-if="drawerTab === 'Raw JSON'">
              <pre
                class="overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-xs leading-6 text-gray-700 whitespace-pre-wrap [overflow-wrap:anywhere] dark:border-white/10 dark:bg-black/20 dark:text-gray-200"
              ><code v-html="drawerJsonHtml"></code></pre>
            </template>

            <template v-else>
              <div v-if="activeEntry.related.length" class="space-y-1">
                <button
                  v-for="related in activeEntry.related"
                  :key="related.id"
                  type="button"
                  class="flex w-full items-start gap-3 rounded-lg px-2 py-3 text-left transition hover:bg-gray-50 dark:hover:bg-white/5"
                  @click="openRelatedEntry(related.id)"
                >
                  <span class="pt-0.5 font-mono text-[11px] text-gray-400 dark:text-gray-500">
                    {{ related.time }}
                  </span>
                  <span class="min-w-0 flex-1 text-sm text-gray-700 dark:text-gray-200">
                    <b class="font-semibold text-gray-900 dark:text-white">{{ related.actor }}</b>
                    · {{ related.title }}
                  </span>
                </button>
              </div>
              <div v-else class="py-10 text-center">
                <div class="text-base font-semibold text-gray-700 dark:text-white">{{ t('auditLog.drawer.noRelated') }}</div>
                <div class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {{ t('auditLog.drawer.noRelatedSub') }}
                </div>
              </div>
            </template>
          </div>

          <div class="flex items-center justify-between gap-3 border-t border-gray-200 px-5 py-3 dark:border-gray-800">
            <span
              class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
              :class="drawerStatusClass"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
              {{ drawerStatusLabel }}
            </span>
            <div class="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg"
                @click="toggleFlag"
              >
                {{ activeEntry.status === 'flagged' ? t('auditLog.actions.unflag') : t('auditLog.actions.flag') }}
              </Button>
              <Button
                size="sm"
                className="rounded-lg"
                @click="toggleReviewed"
              >
                {{ activeEntry.status === 'reviewed' ? t('auditLog.actions.reopen') : t('auditLog.actions.markReviewed') }}
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="exportOpen" class="fixed inset-0 z-[1000] bg-black/30" @click.self="exportOpen = false">
        <div class="mx-auto mt-24 w-full max-w-[560px] rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
          <div class="mb-5">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ t('auditLog.actions.exportTitle') }}</h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {{ t('auditLog.actions.exportSub') }}
            </p>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <button class="rounded-xl border border-blue-600 bg-blue-50 p-4 text-left">
              <div class="font-medium text-blue-700">CSV</div>
              <div class="text-xs text-blue-500">.csv</div>
            </button>
            <button class="rounded-xl border border-gray-200 p-4 text-left dark:border-gray-700">
              <div class="font-medium text-gray-900 dark:text-white">JSON</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">.json</div>
            </button>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
              @click="exportOpen = false"
            >
              {{ t('auditLog.modals.cancel') }}
            </button>
            <button
              class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              @click="exportOpen = false"
            >
              {{ t('auditLog.actions.exportBtn') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { 
  AppShell, 
  Badge, 
  Button, 
  Input, 
  MultipleSelect, 
  PageBreadcrumb, 
  Pagination,
  GridIcon,
  WarningIcon,
  UserCircleIcon
} from '@hivespace/shared'

const { t } = useI18n()

type Severity = 'Info' | 'Warning' | 'Critical'
type ReviewStatus = 'open' | 'reviewed' | 'flagged'
type ViewMode = 'table' | 'timeline'
type AuditBadgeColor = 'info' | 'warning' | 'error'
type DrawerTab = 'Overview' | 'Diff' | 'Raw JSON' | 'Related'

interface AuditDiffItem {
  field: string
  before: string
  after: string
}

interface AuditRelatedRecord {
  id: string
  time: string
  actor: string
  title: string
}

interface AuditResource {
  type: string
  id: string
  label: string
}

interface AuditEntry {
  id: string
  time: string
  fullTimestamp: string
  relativeTime: string
  actor: string
  actorType: string
  actorEmail: string
  actorInitials: string
  actorColor: string
  action: string
  eventTitle: string
  resource: AuditResource
  surface: 'Admin' | 'Seller Center' | 'Storefront'
  severity: Severity
  ip: string
  city: string
  userAgent: string
  status: ReviewStatus
  diff: AuditDiffItem[]
  related: AuditRelatedRecord[]
}

const entries = ref<AuditEntry[]>([
  {
    id: 'EVT-20260510-001',
    time: '10:42',
    fullTimestamp: 'May 10, 2026 10:42:18 ICT',
    relativeTime: '2m ago',
    actor: 'anhtuan@hive.vn',
    actorType: 'System Admin',
    actorEmail: 'anhtuan@hive.vn',
    actorInitials: 'AT',
    actorColor: '#465fff',
    action: 'config.update',
    eventTitle: 'Changed platform commission from 3.2% to 3.0%',
    resource: {
      type: 'Configuration',
      id: 'commission.platform_fee_pct',
      label: 'Configuration / Payments',
    },
    surface: 'Admin',
    severity: 'Info',
    ip: '10.4.21.11',
    city: 'Hanoi, VN',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X) Chrome/124.0',
    status: 'reviewed',
    diff: [
      { field: 'feeRate', before: '3.2%', after: '3.0%' },
      { field: 'effectiveAt', before: '2026-05-01', after: '2026-06-01' },
    ],
    related: [
      { id: 'EVT-20260510-005', time: '07:45', actor: 'nganle@hive.vn', title: 'Granted admin privileges to honghai@hivespace.vn' },
      { id: 'EVT-20260510-003', time: '09:16', actor: 'support-ops', title: 'Buyer status restored after support escalation' },
    ],
  },
  {
    id: 'EVT-20260510-002',
    time: '09:58',
    fullTimestamp: 'May 10, 2026 09:58:07 ICT',
    relativeTime: '46m ago',
    actor: 'risk-engine',
    actorType: 'Automated',
    actorEmail: 'system@hivespace.vn',
    actorInitials: 'RE',
    actorColor: '#667085',
    action: 'payout.block',
    eventTitle: 'Blocked suspicious payout for merchant M-2048',
    resource: {
      type: 'Merchant',
      id: 'M-2048',
      label: 'Merchant #M-2048',
    },
    surface: 'Seller Center',
    severity: 'Critical',
    ip: '172.18.0.22',
    city: 'Ho Chi Minh City, VN',
    userAgent: 'HiveSpace-CLI/2.1.0 (linux)',
    status: 'flagged',
    diff: [
      { field: 'escrowState', before: 'released', after: 'held' },
      { field: 'riskScore', before: '74', after: '96' },
    ],
    related: [
      { id: 'EVT-20260510-004', time: '08:31', actor: 'auth-gateway', title: 'Blocked suspicious login from a new location' },
    ],
  },
  {
    id: 'EVT-20260510-003',
    time: '09:16',
    fullTimestamp: 'May 10, 2026 09:16:54 ICT',
    relativeTime: '1h ago',
    actor: 'support-ops',
    actorType: 'Support',
    actorEmail: 'support-ops@hivespace.vn',
    actorInitials: 'SO',
    actorColor: '#12b76a',
    action: 'buyer.restore',
    eventTitle: 'Buyer access restored after manual KYC review',
    resource: {
      type: 'Buyer',
      id: 'U-1142',
      label: 'Buyer #U-1142',
    },
    surface: 'Admin',
    severity: 'Warning',
    ip: '10.4.22.44',
    city: 'Da Nang, VN',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0) Firefox/115.0',
    status: 'open',
    diff: [
      { field: 'accountState', before: 'suspended', after: 'active' },
      { field: 'reviewQueue', before: 'high-risk', after: 'cleared' },
    ],
    related: [
      { id: 'EVT-20260510-001', time: '10:42', actor: 'anhtuan@hive.vn', title: 'Changed platform commission from 3.2% to 3.0%' },
    ],
  },
  {
    id: 'EVT-20260510-004',
    time: '08:31',
    fullTimestamp: 'May 10, 2026 08:31:22 ICT',
    relativeTime: '2h ago',
    actor: 'auth-gateway',
    actorType: 'Automated',
    actorEmail: 'system@hivespace.vn',
    actorInitials: 'AG',
    actorColor: '#344054',
    action: 'auth.lockout',
    eventTitle: 'Blocked suspicious login after five failed token refresh attempts',
    resource: {
      type: 'Buyer',
      id: 'U-8891',
      label: 'Buyer #U-8891',
    },
    surface: 'Storefront',
    severity: 'Critical',
    ip: '113.190.21.4',
    city: 'Hanoi / Da Nang mismatch',
    userAgent: 'HiveSpace-Mobile/3.4.1 (iOS 17.4; iPhone)',
    status: 'open',
    diff: [
      { field: 'lockStatus', before: 'none', after: 'locked_24h' },
      { field: 'failedAttempts', before: '2', after: '5' },
    ],
    related: [
      { id: 'EVT-20260510-002', time: '09:58', actor: 'risk-engine', title: 'Blocked suspicious payout for merchant M-2048' },
    ],
  },
  {
    id: 'EVT-20260510-005',
    time: '07:45',
    fullTimestamp: 'May 10, 2026 07:45:03 ICT',
    relativeTime: '3h ago',
    actor: 'nganle@hive.vn',
    actorType: 'Platform Admin',
    actorEmail: 'nganle@hive.vn',
    actorInitials: 'NL',
    actorColor: '#7a5af8',
    action: 'role.escalate',
    eventTitle: 'Granted admin privileges to honghai@hivespace.vn',
    resource: {
      type: 'IAM Role',
      id: 'ROLE-308',
      label: 'Admin account / honghai@hivespace.vn',
    },
    surface: 'Admin',
    severity: 'Info',
    ip: '10.4.21.19',
    city: 'Can Tho, VN',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X) Chrome/124.0',
    status: 'reviewed',
    diff: [
      { field: 'roles', before: '["support"]', after: '["support","finance.auditor"]' },
      { field: 'mfaRequired', before: 'false', after: 'true' },
    ],
    related: [
      { id: 'EVT-20260510-001', time: '10:42', actor: 'anhtuan@hive.vn', title: 'Changed platform commission from 3.2% to 3.0%' },
    ],
  },
])

const densityBars = [
  { hour: '00', value: 25, critical: false },
  { hour: '02', value: 32, critical: false },
  { hour: '04', value: 20, critical: false },
  { hour: '06', value: 42, critical: false },
  { hour: '08', value: 88, critical: true },
  { hour: '10', value: 76, critical: false },
  { hour: '12', value: 60, critical: false },
  { hour: '14', value: 56, critical: false },
  { hour: '16', value: 70, critical: false },
  { hour: '18', value: 48, critical: false },
  { hour: '20', value: 36, critical: false },
  { hour: '22', value: 28, critical: false },
]

const searchQuery = ref('')
const activeTimeRange = ref('24h')
const selectedBar = ref('08')
interface FilterOption {
  value: string | number
  label: string
}

const surfaceFilter = ref<FilterOption[]>([])
const severityFilter = ref<FilterOption[]>([])
const actorFilter = ref<FilterOption[]>([])
const viewMode = ref<ViewMode>('table')
const live = ref(true)
const exportOpen = ref(false)
const newEntryIds = ref<Set<string>>(new Set())

const LIVE_ACTORS = [
  { name: 'anhtuan@hive.vn', type: 'System Admin', email: 'anhtuan@hive.vn', initials: 'AT', color: '#465fff' },
  { name: 'risk-engine', type: 'Automated', email: 'system@hivespace.vn', initials: 'RE', color: '#667085' },
  { name: 'support-ops', type: 'Support', email: 'support-ops@hivespace.vn', initials: 'SO', color: '#12b76a' },
  { name: 'nganle@hive.vn', type: 'Platform Admin', email: 'nganle@hive.vn', initials: 'NL', color: '#7a5af8' },
  { name: 'auth-gateway', type: 'Automated', email: 'system@hivespace.vn', initials: 'AG', color: '#344054' },
]

const LIVE_TEMPLATES: Array<Partial<AuditEntry> & { buildEventTitle: () => string }> = [
  {
    action: 'merchant.suspend', eventTitle: '', surface: 'Admin', severity: 'Critical',
    buildEventTitle: () => 'Suspended merchant Shop Hoa Anh Đào for policy violation',
    resource: { type: 'Merchant', id: `MRC-${Math.floor(Math.random() * 90000) + 10000}`, label: 'Merchant account' },
    diff: [{ field: 'status', before: 'active', after: 'suspended' }], related: [],
  },
  {
    action: 'role.escalate', eventTitle: '', surface: 'Admin', severity: 'Warning',
    buildEventTitle: () => 'Granted role Finance Auditor to levanthang@hivespace.vn',
    resource: { type: 'IAM Role', id: `ROLE-${Math.floor(Math.random() * 900) + 100}`, label: 'Finance Auditor' },
    diff: [{ field: 'roles', before: '["support"]', after: '["support","finance.auditor"]' }], related: [],
  },
  {
    action: 'config.update', eventTitle: '', surface: 'Admin', severity: 'Warning',
    buildEventTitle: () => 'Changed platform commission from 4.5% to 5.2%',
    resource: { type: 'Configuration', id: 'commission.platform_fee_pct', label: 'Platform commission' },
    diff: [{ field: 'platform_fee_pct', before: '4.5%', after: '5.2%' }], related: [],
  },
  {
    action: 'kyb.approve', eventTitle: '', surface: 'Admin', severity: 'Info',
    buildEventTitle: () => 'Approved KYB submission for Mỹ Phẩm Sài Gòn',
    resource: { type: 'KYB Case', id: `KYB-${Math.floor(Math.random() * 900000) + 100000}`, label: 'Business verification' },
    diff: [{ field: 'kyb_status', before: 'pending_review', after: 'approved' }], related: [],
  },
  {
    action: 'auth.lockout', eventTitle: '', surface: 'Storefront', severity: 'Critical',
    buildEventTitle: () => 'Blocked suspicious login after five failed token refresh attempts',
    resource: { type: 'Buyer', id: `U-${Math.floor(Math.random() * 9000) + 1000}`, label: `Buyer #U-${Math.floor(Math.random() * 9000) + 1000}` },
    diff: [{ field: 'lockStatus', before: 'none', after: 'locked_24h' }, { field: 'failedAttempts', before: '2', after: '5' }], related: [],
  },
  {
    action: 'payout.block', eventTitle: '', surface: 'Seller Center', severity: 'Critical',
    buildEventTitle: () => `Blocked suspicious payout for merchant M-${Math.floor(Math.random() * 9000) + 1000}`,
    resource: { type: 'Merchant', id: `M-${Math.floor(Math.random() * 9000) + 1000}`, label: `Merchant account` },
    diff: [{ field: 'escrowState', before: 'released', after: 'held' }], related: [],
  },
  {
    action: 'buyer.restore', eventTitle: '', surface: 'Admin', severity: 'Info',
    buildEventTitle: () => 'Buyer access restored after manual KYC review',
    resource: { type: 'Buyer', id: `U-${Math.floor(Math.random() * 9000) + 1000}`, label: `Buyer account` },
    diff: [{ field: 'accountState', before: 'suspended', after: 'active' }], related: [],
  },
]

const LIVE_IPS = ['113.160.92.14', '14.241.180.22', '171.224.45.7', '125.235.18.91', '203.205.77.14']
const LIVE_CITIES = ['Hanoi, VN', 'Ho Chi Minh City, VN', 'Da Nang, VN', 'Hai Phong, VN', 'Can Tho, VN']
const LIVE_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X) Chrome/124.0'

const tickLive = () => {
  const tpl = LIVE_TEMPLATES[Math.floor(Math.random() * LIVE_TEMPLATES.length)]
  const actor = LIVE_ACTORS[Math.floor(Math.random() * LIVE_ACTORS.length)]
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const id = `EVT-LIVE-${Date.now().toString(36)}`

  const newEntry: AuditEntry = {
    id,
    time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
    fullTimestamp: now.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' }),
    relativeTime: 'just now',
    actor: actor.name,
    actorType: actor.type,
    actorEmail: actor.email,
    actorInitials: actor.initials,
    actorColor: actor.color,
    action: tpl.action!,
    eventTitle: tpl.buildEventTitle(),
    resource: { ...tpl.resource! },
    surface: tpl.surface as AuditEntry['surface'],
    severity: tpl.severity as AuditEntry['severity'],
    ip: LIVE_IPS[Math.floor(Math.random() * LIVE_IPS.length)],
    city: LIVE_CITIES[Math.floor(Math.random() * LIVE_CITIES.length)],
    userAgent: LIVE_UA,
    status: 'open',
    diff: (tpl.diff ?? []).map((d) => ({ ...d })),
    related: [],
  }

  entries.value.unshift(newEntry)
  if (entries.value.length > 500) entries.value.length = 500

  newEntryIds.value = new Set([...newEntryIds.value, id])
  currentPage.value = 1
  setTimeout(() => {
    newEntryIds.value = new Set([...newEntryIds.value].filter((x) => x !== id))
  }, 1500)
}

let liveTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  liveTimer = setInterval(() => {
    if (live.value) tickLive()
  }, 4500)
})
onUnmounted(() => {
  if (liveTimer) clearInterval(liveTimer)
})

const drawerTabs = computed<Array<{ label: string; value: DrawerTab }>>(() => [
  { label: t('auditLog.drawer.overview'), value: 'Overview' },
  { label: t('auditLog.drawer.diff'), value: 'Diff' },
  { label: t('auditLog.drawer.rawJson'), value: 'Raw JSON' },
  { label: t('auditLog.drawer.related'), value: 'Related' },
])
const drawerTab = ref<DrawerTab>('Overview')
const activeEntry = ref<AuditEntry | null>(null)
const viewModeOptions = computed<Array<{ label: string; value: ViewMode }>>(() => [
  { label: t('auditLog.viewModes.table'), value: 'table' },
  { label: t('auditLog.viewModes.timeline'), value: 'timeline' },
])



const surfaceDotClasses: Record<AuditEntry['surface'], string> = {
  Admin: 'bg-violet-500',
  'Seller Center': 'bg-blue-500',
  Storefront: 'bg-pink-500',
}

const currentPage = ref(1)
const pageSize = ref(10)


const filteredEntries = computed(() => {
  const selectedSurfaces = surfaceFilter.value.map((o) => o.value)
  const selectedSeverities = severityFilter.value.map((o) => o.value)
  const selectedActors = actorFilter.value.map((o) => o.value)

  return entries.value.filter((entry) => {
    if (selectedSurfaces.length > 0 && !selectedSurfaces.includes(entry.surface)) return false
    if (selectedSeverities.length > 0 && !selectedSeverities.includes(entry.severity)) return false
    if (selectedActors.length > 0 && !selectedActors.includes(entry.actor)) return false
    if (!searchQuery.value) return true
    const q = searchQuery.value.toLowerCase()

    return [
      entry.actor,
      entry.action,
      entry.eventTitle,
      entry.resource.id,
      entry.resource.label,
      entry.ip,
      entry.city,
    ].some((value) => value.toLowerCase().includes(q))
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredEntries.value.length / pageSize.value)))

const pagedEntries = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredEntries.value.slice(start, start + pageSize.value)
})

const surfaceOptions = computed(() => [
  { value: 'Admin', label: t('auditLog.filters.surfaces.admin'), description: 'platform' },
  { value: 'Seller Center', label: t('auditLog.filters.surfaces.sellerCenter'), description: 'platform' },
  { value: 'Storefront', label: t('auditLog.filters.surfaces.storefront'), description: 'platform' },
])

const severityOptions = computed(() => [
  { value: 'Info', label: t('auditLog.filters.severities.info') },
  { value: 'Warning', label: t('auditLog.filters.severities.warning') },
  { value: 'Critical', label: t('auditLog.filters.severities.critical') },
])

const actorOptions = computed(() => {
  return Array.from(new Set(entries.value.map((entry) => entry.actor))).map((actor) => ({
    value: actor,
    label: actor,
  }))
})

interface ActiveChip {
  key: string
  label: string
  type: 'search' | 'surface' | 'severity' | 'actor'
  value: string | number
}

const activeChips = computed<ActiveChip[]>(() => {
  const chips: ActiveChip[] = []
  if (searchQuery.value) {
    chips.push({ key: 'search', label: `"${searchQuery.value}"`, type: 'search', value: searchQuery.value })
  }
  for (const o of surfaceFilter.value) {
    chips.push({ key: `surface-${o.value}`, label: `Surface: ${o.label}`, type: 'surface', value: o.value })
  }
  for (const o of severityFilter.value) {
    chips.push({ key: `severity-${o.value}`, label: `Severity: ${o.label}`, type: 'severity', value: o.value })
  }
  for (const o of actorFilter.value) {
    chips.push({ key: `actor-${o.value}`, label: `Actor: ${o.label}`, type: 'actor', value: o.value })
  }
  return chips
})

const removeChip = (chip: ActiveChip) => {
  if (chip.type === 'search') {
    searchQuery.value = ''
  } else if (chip.type === 'surface') {
    surfaceFilter.value = surfaceFilter.value.filter((o) => o.value !== chip.value)
  } else if (chip.type === 'severity') {
    severityFilter.value = severityFilter.value.filter((o) => o.value !== chip.value)
  } else if (chip.type === 'actor') {
    actorFilter.value = actorFilter.value.filter((o) => o.value !== chip.value)
  }
}

const clearAllFilters = () => {
  searchQuery.value = ''
  surfaceFilter.value = []
  severityFilter.value = []
  actorFilter.value = []
}

const statCards = computed(() => [
  {
    label: t('auditLog.metrics.total'),
    value: '1,284',
    sub: t('auditLog.metrics.totalSub'),
    iconBg: 'bg-brand-50',
    iconColor: 'text-brand-600',
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  },
  {
    label: t('auditLog.metrics.warning'),
    value: '17',
    sub: t('auditLog.metrics.warningSub'),
    iconBg: 'bg-error-50',
    iconColor: 'text-error-600',
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>`,
  },
  {
    label: t('auditLog.metrics.actors'),
    value: '23',
    sub: t('auditLog.metrics.actorsSub'),
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>`,
  },
  {
    label: t('auditLog.metrics.error'),
    value: '42',
    sub: t('auditLog.metrics.errorSub'),
    iconBg: 'bg-warning-50',
    iconColor: 'text-warning-600',
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  },
])

const timeRanges = ['1h', '24h', '7d', '30d']

const severityStyles: Record<Severity, { color: AuditBadgeColor; dotClass: string }> = {
  Critical: { color: 'error', dotClass: 'bg-error-500' },
  Warning: { color: 'warning', dotClass: 'bg-warning-500' },
  Info: { color: 'info', dotClass: 'bg-brand-500' },
}

const overviewRows = computed(() => {
  if (!activeEntry.value) return []

  return [
    { label: t('auditLog.drawer.event'), value: activeEntry.value.eventTitle, type: 'text' },
    { label: t('auditLog.drawer.resource'), value: activeEntry.value.resource.label, type: 'resource' },
    { label: t('auditLog.columns.surface'), value: activeEntry.value.surface, type: 'surface' },
    { label: t('auditLog.drawer.when'), value: `${activeEntry.value.fullTimestamp} · ${activeEntry.value.relativeTime}`, type: 'text' },
    { label: t('auditLog.drawer.ipGeo'), value: activeEntry.value.ip, type: 'ip' },
    { label: t('auditLog.drawer.userAgent'), value: activeEntry.value.userAgent, type: 'user-agent' },
  ]
})

const drawerStatusLabel = computed(() => {
  if (!activeEntry.value) return ''

  switch (activeEntry.value.status) {
    case 'flagged':
      return t('auditLog.drawer.statusFlagged')
    case 'reviewed':
      return t('auditLog.drawer.statusReviewed')
    default:
      return t('auditLog.drawer.statusAwaiting')
  }
})

const drawerStatusClass = computed(() => {
  if (!activeEntry.value) return ''

  switch (activeEntry.value.status) {
    case 'flagged':
      return 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200'
    case 'reviewed':
      return 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-200'
    default:
      return 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200'
  }
})

const drawerJsonHtml = computed(() => {
  if (!activeEntry.value) return ''

  const payload = {
    id: activeEntry.value.id,
    time: activeEntry.value.fullTimestamp,
    action: activeEntry.value.action,
    severity: activeEntry.value.severity,
    surface: activeEntry.value.surface,
    status: activeEntry.value.status,
    actor: {
      name: activeEntry.value.actor,
      role: activeEntry.value.actorType,
      email: activeEntry.value.actorEmail,
    },
    resource: activeEntry.value.resource,
    request: {
      ip: activeEntry.value.ip,
      geo: activeEntry.value.city,
      userAgent: activeEntry.value.userAgent,
    },
    diff: activeEntry.value.diff,
  }

  return syntaxHighlightJson(JSON.stringify(payload, null, 2))
})

watch([searchQuery, surfaceFilter, severityFilter, actorFilter, pageSize], () => {
  currentPage.value = 1
}, { deep: true })

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const openEntry = (entry: AuditEntry) => {
  activeEntry.value = entry
  drawerTab.value = 'Overview'
}

const openRelatedEntry = (id: string) => {
  const entry = entries.value.find((item) => item.id === id)

  if (entry) {
    openEntry(entry)
  }
}

const closeDrawer = () => {
  activeEntry.value = null
}

const toggleFlag = () => {
  if (!activeEntry.value) return

  activeEntry.value.status = activeEntry.value.status === 'flagged' ? 'open' : 'flagged'
}

const toggleReviewed = () => {
  if (!activeEntry.value) return

  activeEntry.value.status = activeEntry.value.status === 'reviewed' ? 'open' : 'reviewed'
}

const escapeHtml = (value: string) => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const syntaxHighlightJson = (value: string) => {
  return escapeHtml(value)
    .replace(/(&quot;[^&]+&quot;)(\s*:)/g, '<span class="text-violet-500 dark:text-violet-300">$1</span>$2')
    .replace(/:\s*(&quot;[^&]*&quot;)/g, ': <span class="text-green-600 dark:text-green-300">$1</span>')
    .replace(/:\s*(\d+\.?\d*)/g, ': <span class="text-sky-600 dark:text-sky-300">$1</span>')
}
</script>

<style scoped>
@keyframes rowFlash {
  0% {
    background-color: color-mix(in srgb, #12b76a 12%, transparent);
  }
  100% {
    background-color: transparent;
  }
}

.is-new {
  animation: rowFlash 1.5s ease-out forwards;
}
</style>
