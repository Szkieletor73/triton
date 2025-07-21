<script lang="ts">
  interface Props {
    size?: 'small' | 'medium' | 'large'
    color?: string
    message?: string
  }

  let { size = 'medium', color, message }: Props = $props()

  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large'
  }
</script>

<div class="loading-container">
  <div 
    class="spinner {sizeClasses[size]}" 
    style:border-top-color={color}
    aria-label="Loading"
    role="status"
  ></div>
  {#if message}
    <p class="loading-message">{message}</p>
  {/if}
</div>

<style lang="scss">
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
  }

  .spinner {
    border: 2px solid var(--color-surface-variant, #e0e0e0);
    border-top: 2px solid var(--color-primary, #007bff);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .spinner-small {
    width: 16px;
    height: 16px;
    border-width: 1px;
  }

  .spinner-medium {
    width: 24px;
    height: 24px;
  }

  .spinner-large {
    width: 32px;
    height: 32px;
    border-width: 3px;
  }

  .loading-message {
    color: var(--color-on-surface-variant, #666);
    font-size: 0.875rem;
    margin: 0;
    text-align: center;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>