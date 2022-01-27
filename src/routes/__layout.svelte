<script lang="ts">
    import "../app.css"
    import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';
</script>
<TopAppBar variant="static" color={'secondary'}>
        <Row>
            <Section>
                <Title>Aavegotchi Leaderboard  📈</Title>
            </Section>
        </Row>
</TopAppBar>
<div class="p-4">
    <slot></slot>
</div>