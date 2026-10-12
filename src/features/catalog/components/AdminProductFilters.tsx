import type { Category } from '@/api/types/catalog'
import { FilterBar } from '@/components/ui/FilterBar'
import { SelectField } from '@/components/ui/SelectField'
import { TextField } from '@/components/ui/TextField'
import { formText } from '@/lib/form'

import type { AdminProductFilters as Filters } from '../lib/admin-filters'

interface AdminProductFiltersProps {
  filters: Filters
  categories: Category[]
  onChange: (next: Filters) => void
}

export function AdminProductFilters({
  filters,
  categories,
  onChange,
}: AdminProductFiltersProps) {
  const { name, sku, category, min, max } = filters

  return (
    <FilterBar
      resetKey={[name, sku, category, min, max, categories.length].join('|')}
      onApply={(data) => {
        onChange({
          page: 1,
          name: formText(data, 'name'),
          sku: formText(data, 'sku'),
          category: formText(data, 'category'),
          min: formText(data, 'min'),
          max: formText(data, 'max'),
        })
      }}
      onClear={() => {
        onChange({ page: 1, name: '', sku: '', category: '', min: '', max: '' })
      }}
    >
      <TextField name="name" label="Name contains" defaultValue={name} />
      <TextField
        name="sku"
        label="SKU"
        hint="The full SKU"
        defaultValue={sku}
        spellCheck={false}
      />
      <SelectField name="category" label="Category" defaultValue={category}>
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </SelectField>
      <TextField
        name="min"
        label="Min price"
        type="number"
        min="0"
        step="0.01"
        defaultValue={min}
      />
      <TextField
        name="max"
        label="Max price"
        type="number"
        min="0"
        step="0.01"
        defaultValue={max}
      />
    </FilterBar>
  )
}
