<script lang="ts">
  import LoadingSpinner from './LoadingSpinner.svelte'
  import type { LoadingState } from '$lib/utils/loadingUtils'

  interface Props {
    state: LoadingState
    loadingMessage?: string
    errorMessage?: string
    showRetry?: boolean
    onRetry?: () => void
    children: any
  }

  let { 
    state, 
    loadingMessage = 'Loading...', 
    errorMessage,
    showRetry = true,
    onRetry,
    children 
  }: Props = $props()

  function handleRetry() {
    onRetry?.()
  }
</script>

{#if state.isLoading}
  <div class="loading-state">
    <LoadingSpinner message={loadingMessage} />
  </div>
{:else if state.error}
  <div class="error-state">
    <div class="error-content">
      <p class="error-message">
        {errorMessage || state.error}
      </p>
      {#if showRetry && onRetry}
        <button class="retry-button" onclick={handleRetry}>
          Try Again
        </button>
      {/if}
    </div>
  </div>
{:else}
  {@render children()}
{/if}

<style lang="scss">
  .loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100px;
    padding: 2rem;
  }

  .error-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100px;
    padding: 2rem;
  }

  .error-content {
    text-align: center;
    max-width: 300px;
  }

  .error-message {
    color: var(--color-error, #dc3545);
    margin-bottom: 1rem;
    line-height: 1.5;
  }

  .retry-button {
    background-color: var(--color-primary, #007bff);
    color: var(--color-on-primary, white);
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--color-primary-variant, #0056b3);
    }

    &:focus {
      outline: 2px solid var(--color-primary, #007bff);
      outline-offset: 2px;
    }
  }
</style>