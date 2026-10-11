import type { Meta, StoryObj } from '@storybook/react-vite'

import { Tab, TabList, TabPanel, Tabs } from './Tabs'

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  args: { defaultValue: 'all' },
  render: (args) => (
    <Tabs {...args}>
      <TabList aria-label="Filter orders">
        <Tab value="all">All (7)</Tab>
        <Tab value="ongoing">Ongoing (4)</Tab>
        <Tab value="past">Past (3)</Tab>
      </TabList>
      <TabPanel value="all">All orders</TabPanel>
      <TabPanel value="ongoing">Orders in progress</TabPanel>
      <TabPanel value="past">Past orders</TabPanel>
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
