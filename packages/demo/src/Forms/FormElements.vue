<template>
  <PageBreadcrumb :pageTitle="currentPageTitle" />

  <div class="space-y-5 sm:space-y-6">
    <ComponentCard
      title="Input Variants"
      description="Public Input props: label position, type, disabled, required, error, prefix, and count."
    >
      <div class="grid gap-4 lg:grid-cols-2">
        <Input v-model="inputs.basic" label="Basic input" placeholder="Type something" />
        <Input
          v-model="inputs.email"
          label="Email"
          type="email"
          placeholder="name@example.com"
          required
        />
        <Input
          v-model="inputs.leftLabel"
          label="Left label"
          labelPosition="left"
          placeholder="Horizontal layout"
        />
        <Input
          v-model="inputs.password"
          label="Password"
          type="password"
          placeholder="Secret"
        />
        <Input
          v-model="inputs.prefixed"
          label="Prefixed"
          placeholder="example.com"
          prefix="https"
        />
        <Input
          v-model="inputs.counted"
          label="Character count"
          placeholder="Max 30 characters"
          showCount
          maxlength="30"
        />
        <Input
          v-model="inputs.disabled"
          label="Disabled"
          disabled
          placeholder="Disabled field"
        />
        <Input
          v-model="inputs.error"
          label="With error"
          error="A validation message is shown here."
          placeholder="Invalid content"
        />
      </div>
    </ComponentCard>

    <ComponentCard
      title="Select Variants"
      description="Single and multiple select states, including disabled and constrained menus."
    >
      <div class="grid gap-4 lg:grid-cols-2">
        <Select
          v-model="singleSelect"
          :options="fruitOptions"
          label="Single select"
          placeholder="Choose a fruit"
        />
        <Select
          v-model="singleSelectCompact"
          :options="manyOptions"
          label="Custom max height"
          placeholder="Long list"
          maxHeight="max-h-32"
        />
        <Select
          v-model="singleSelectDisabled"
          :options="fruitOptions"
          label="Disabled select"
          placeholder="Unavailable"
          disabled
        />
        <MultipleSelect
          v-model="multiSelect"
          :options="fruitOptions"
          label="Multiple select"
          placeholder="Select several fruits"
        />
        <MultipleSelect
          v-model="multiSelectPreset"
          :options="fruitOptions"
          label="Preselected values"
          placeholder="Already selected"
        />
      </div>
    </ComponentCard>

    <ComponentCard
      title="TextArea Variants"
      description="Label positions, required, disabled, custom rows, and validation state."
    >
      <div class="grid gap-4 lg:grid-cols-2">
        <TextArea
          v-model="textareas.basic"
          label="Basic"
          placeholder="Add a description"
        />
        <TextArea
          v-model="textareas.required"
          label="Required"
          placeholder="This field is required"
          required
          :rows="3"
        />
        <TextArea
          v-model="textareas.left"
          label="Left label"
          labelPosition="left"
          placeholder="Horizontal label"
          :rows="3"
        />
        <TextArea
          v-model="textareas.bottom"
          label="Bottom label"
          labelPosition="bottom"
          placeholder="Bottom label placement"
          :rows="3"
        />
        <TextArea
          v-model="textareas.disabled"
          label="Disabled"
          disabled
          :rows="2"
        />
        <TextArea
          v-model="textareas.error"
          label="Error state"
          error="This example shows the error prop."
        />
      </div>
    </ComponentCard>

    <ComponentCard
      title="Choice Controls"
      description="Checkbox, Radio, RadioGroup, and ToggleSwitch public states."
    >
      <div class="grid gap-6 lg:grid-cols-2">
        <div class="space-y-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Checkbox</p>
          <Checkbox v-model="checkboxes.default">Default checkbox</Checkbox>
          <Checkbox v-model="checkboxes.checked">Checked checkbox</Checkbox>
          <Checkbox v-model="checkboxes.disabled" disabled>Disabled checkbox</Checkbox>
        </div>

        <div class="space-y-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Radio</p>
          <div class="space-y-3">
            <Radio v-model="singleRadio" name="single-radio" value="first">Single radio</Radio>
            <Radio v-model="singleRadio" name="single-radio" value="second" forceSelection>
              Force selection
            </Radio>
            <Radio v-model="singleRadio" name="single-radio" value="disabled" disabled>
              Disabled radio
            </Radio>
          </div>
        </div>

        <div class="space-y-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300">RadioGroup</p>
          <RadioGroup
            v-model="radioGroupHorizontal"
            :options="radioOptions"
            name="radio-group-horizontal"
            direction="horizontal"
          />
          <RadioGroup
            v-model="radioGroupVertical"
            :options="radioOptions"
            name="radio-group-vertical"
            direction="vertical"
          />
        </div>

        <div class="space-y-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300">ToggleSwitch</p>
          <div class="flex flex-wrap gap-6">
            <ToggleSwitch v-model="toggles.default">Default</ToggleSwitch>
            <ToggleSwitch v-model="toggles.checked">Checked</ToggleSwitch>
          </div>
        </div>
      </div>
    </ComponentCard>

    <ComponentCard
      title="Pickers And Quantity"
      description="Date, time, datetime, and quantity control variants."
    >
      <div class="grid gap-4 lg:grid-cols-2">
        <DatePicker v-model="dateValue" label="Date picker" placeholder="Pick a date" />
        <DatePicker
          v-model="dateIsoValue"
          label="Date picker (ISO)"
          placeholder="ISO output"
          format="iso"
        />
        <TimePicker v-model="timeLocalValue" label="Time picker" format="time-local" />
        <TimePicker v-model="timeIsoValue" label="Time picker (ISO)" format="iso" />
        <DateTimePicker
          v-model="dateTimeValue"
          label="Datetime picker"
          placeholder="Pick date and time"
          format="datetime-local"
        />
        <DateTimePicker
          v-model="dateTimeDisabled"
          label="Disabled datetime picker"
          placeholder="Unavailable"
          disabled
        />
        <div class="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
          <p class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">QuantityControl</p>
          <div class="flex flex-wrap items-center gap-4">
            <QuantityControl v-model="quantitySmall" size="sm" :min="1" :max="5" />
            <QuantityControl v-model="quantityMedium" size="md" :min="0" :max="10" />
            <span class="text-sm text-gray-500 dark:text-gray-400">
              values: {{ quantitySmall }} / {{ quantityMedium }}
            </span>
          </div>
        </div>
      </div>
    </ComponentCard>

    <ComponentCard
      title="File Inputs"
      description="FileInput preview props and Dropzone upload URL variations."
    >
      <div class="grid gap-6 xl:grid-cols-2">
        <div class="space-y-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
          <FileInput
            v-model="fileTop"
            label="Circle preview"
            helpText="Default top preview, medium size."
          />
          <FileInput
            v-model="fileRight"
            label="Right preview"
            previewDirection="right"
            previewShape="rectangle"
            previewSize="lg"
            helpText="Large rectangular preview to the right."
          />
          <FileInput
            v-model="fileError"
            label="Required with error"
            required
            error="This example forces the error state."
            buttonText="Choose image"
          />
        </div>

        <div class="space-y-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
          <div>
            <p class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Dropzone</p>
            <Dropzone />
          </div>
          <div>
            <p class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Dropzone with custom URL
            </p>
            <Dropzone uploadUrl="/api/demo-upload" />
          </div>
        </div>
      </div>
    </ComponentCard>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

import {
  Checkbox,
  ComponentCard,
  DatePicker,
  DateTimePicker,
  Dropzone,
  FileInput,
  Input,
  MultipleSelect,
  PageBreadcrumb,
  QuantityControl,
  Radio,
  RadioGroup,
  Select,
  TextArea,
  TimePicker,
  ToggleSwitch,
} from '@hivespace/shared'

const currentPageTitle = ref('Form Elements')

const fruitOptions = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'dragonfruit', label: 'Dragonfruit' },
]

const manyOptions = Array.from({ length: 12 }, (_, index) => ({
  value: `option-${index + 1}`,
  label: `Option ${index + 1}`,
}))

const inputs = reactive({
  basic: '',
  email: '',
  leftLabel: '',
  password: '',
  prefixed: '',
  counted: '',
  disabled: 'Disabled value',
  error: 'Broken input',
})

const singleSelect = ref<string | number | null>(null)
const singleSelectCompact = ref<string | number | null>('option-2')
const singleSelectDisabled = ref<string | number | null>('banana')
const multiSelect = ref<{ value: string | number; label: string }[]>([])
const multiSelectPreset = ref([
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'dragonfruit', label: 'Dragonfruit' },
])

const textareas = reactive({
  basic: '',
  required: '',
  left: '',
  bottom: '',
  disabled: 'Locked content',
  error: 'Invalid description',
})

const checkboxes = reactive({
  default: false,
  checked: true,
  disabled: true,
})

const singleRadio = ref<string | number | boolean | null>('first')
const radioGroupHorizontal = ref<string | number | boolean | null>('draft')
const radioGroupVertical = ref<string | number | boolean | null>('review')
const radioOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Review', value: 'review' },
  { label: 'Published', value: 'published', disabled: true },
]

const toggles = reactive({
  default: false,
  checked: true,
})

const dateValue = ref<string | Date | null>(null)
const dateIsoValue = ref<string | Date | null>('2026-05-10T00:00:00.000Z')
const timeLocalValue = ref<string | Date | null>('12:30')
const timeIsoValue = ref<string | Date | null>('2026-05-01T09:15:00.000Z')
const dateTimeValue = ref<string | Date | null>('2026-05-15T13:45')
const dateTimeDisabled = ref<string | Date | null>('2026-05-20T08:00')
const quantitySmall = ref(2)
const quantityMedium = ref(5)

const fileTop = ref<File | null>(null)
const fileRight = ref<File | null>(null)
const fileError = ref<File | null>(null)
</script>
