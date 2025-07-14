<script lang="ts">
    import ModalManager from "$lib/components/modal/ModalManager"
    import type { Component } from "svelte"

    const modals = $derived(ModalManager.modals)
</script>

{#snippet modalInstance(
    id: number,
    ModalComponent: Component<any>,
    props: Record<string, any>
    )}
    <div class="modal-backdrop"
        role="dialog"
        tabindex=0
        onclick={() => {
                ModalManager.close(id)
            }
        }
        onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                ModalManager.close(id)
            }
        }}
        >
        <div class="modal-container">
            <ModalComponent {...props} />
        </div>
    </div>
{/snippet}

{#each modals as modal}
    {@render modalInstance(modal.id, modal.component, modal.props)}
{/each}

<style lang="scss">
    .modal-backdrop {
        z-index: 100;

        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        
        background: var(--color-modal-overlay);
    }

    .modal-container {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);

        display: grid;
        grid-template: max-content/max-content;

        border-radius: 16px;
        box-shadow: black 0px 4px 4px 0px;

        background: var(--color-surface);
        color: var(--color-surface-text);
    }
</style>