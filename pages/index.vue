<script setup lang="ts">
import type { Task, Subtask } from '@/types/index'

const { data: tasks, error } = await useFetch<Task[]>(
  'http://51.83.230.116:9000/tasks',
)

const subtasks = ref<Record<Task['id'], Subtask[]>>({})

const onSubtasksOpen = async (task: Task) => {
  const areSubtasksFetched = subtasks.value[task.id]

  if (areSubtasksFetched) {
    return
  }

  const requests = task.subtasks.map((id) =>
    $fetch<Subtask>(`http://51.83.230.116:9000/subtasks/${id}`),
  )
  const subtasksForTask = await Promise.allSettled(requests).then((results) => {
    const fulfilledResults = results.filter(
      (result) => result.status === 'fulfilled',
    )
    const rejectedResultsCount = requests.length - fulfilledResults.length

    if (rejectedResultsCount) {
      const toast = useToast()
      toast.add({
        title: `Failed to get ${rejectedResultsCount} of the subtasks for "${task.title}".`,
        color: 'red',
        id: crypto.randomUUID(),
        timeout: 10000,
      })
    }

    return fulfilledResults.map((result) => result.value)
  })

  subtasksForTask.sort((a, b) => a.title.localeCompare(b.title))
  subtasks.value[task.id] = subtasksForTask
}

const saveTaskStateChange = async (task: Task | Subtask) => {
  const resourceType = 'subtasks' in task ? 'tasks' : 'subtasks'
  await $fetch(`http://51.83.230.116:9000/${resourceType}/${task.id}`, {
    method: 'PATCH',
    body: { done: task.done },
  }).catch(() => {
    const toast = useToast()

    toast.add({
      title: `Failed to save "${task.title}" state change.`,
      color: 'red',
      id: crypto.randomUUID(),
    })
  })
}

const updateParentTaskState = (task: Task) => {
  const areSubtasksDone = subtasks.value[task.id].every(({ done }) => done)

  if (areSubtasksDone) {
    task.done = true
    saveTaskStateChange(task)
  }
}
</script>

<template>
  <UContainer class="flex min-h-screen justify-center">
    <Head>
      <Title>Home Page</Title>
    </Head>

    <UCard class="my-auto min-h-80 w-full max-w-lg">
      <h1 class="mb-4 text-xl">Task Manager</h1>
      <p
        v-if="error"
        role="alert"
        class="text-red-300"
      >
        Oops! An error occurred. Please try again later.
      </p>
      <ul v-else>
        <li
          v-for="task in tasks"
          :key="task.id"
          class="flex flex-wrap"
        >
          <HeadlessDisclosure v-slot="{ open }">
            <UCheckbox
              v-model="task.done"
              @change="saveTaskStateChange(task)"
            >
              <template #label>
                <span
                  class="mr-3"
                  :class="{ 'line-through': task.done }"
                >
                  {{ task.title }}
                </span>
              </template>
            </UCheckbox>

            <HeadlessDisclosureButton
              v-if="task.subtasks.length"
              class="flex items-center"
              aria-label="Subtasks"
              @click="onSubtasksOpen(task)"
              @keyup.enter="onSubtasksOpen(task)"
              @keyup.space="onSubtasksOpen(task)"
            >
              <UIcon
                name="mdi:chevron-up-circle-outline"
                class="transition"
                :class="{ 'rotate-180': !open }"
              />
            </HeadlessDisclosureButton>
            <transition
              enter-active-class="transition ease-out"
              enter-from-class="transform scale-95 opacity-0"
              enter-to-class="transform scale-100 opacity-100"
              leave-active-class="transition ease-out"
              leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0"
            >
              <HeadlessDisclosurePanel class="w-full pb-1 pl-8">
                <ul v-if="subtasks[task.id]?.length">
                  <li
                    v-for="subtask in subtasks[task.id]"
                    :key="subtask.id"
                  >
                    <UCheckbox
                      v-model="subtask.done"
                      @change="
                        () => {
                          saveTaskStateChange(subtask)
                          updateParentTaskState(task)
                        }
                      "
                    >
                      <template #label>
                        <span :class="{ 'line-through': subtask.done }">
                          {{ subtask.title }}
                        </span>
                      </template>
                    </UCheckbox>
                  </li>
                </ul>
                <div
                  v-else-if="subtasks[task.id] && !subtasks[task.id].length"
                  class="text-gray-400"
                >
                  No subtasks found
                </div>
              </HeadlessDisclosurePanel>
            </transition>
          </HeadlessDisclosure>
        </li>
      </ul>
    </UCard>
  </UContainer>
</template>
