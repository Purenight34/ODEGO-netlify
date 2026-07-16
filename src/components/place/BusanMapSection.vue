<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import sightseeingRaw from '../../data/부산_관광지.json'
import courseRaw from '../../data/부산_여행코스.json'
import festivalRaw from '../../data/부산_축제공연행사.json'

const categoryList = [
	{ key: 'all', label: '전체' },
	{ key: 'sightseeing', label: '관광지' },
	{ key: 'course', label: '여행코스' },
	{ key: 'festival', label: '축제공연행사' },
]

const sourceMap = {
	sightseeing: {
		label: '관광지',
		color: '#2563eb',
		dataset: sightseeingRaw.items ?? [],
	},
	course: {
		label: '여행코스',
		color: '#16a34a',
		dataset: courseRaw.items ?? [],
	},
	festival: {
		label: '축제공연행사',
		color: '#dc2626',
		dataset: festivalRaw.items ?? [],
	},
}

/**
 * 관광공사 JSON 데이터를 지도에서 사용하기 편한 공통 형태로 변환한다.
 */
function normalizePlaces(sourceKey, dataset) {
	return dataset
		.map((item) => {
			const longitude = Number(item.mapx)
			const latitude = Number(item.mapy)

			const extraInfo =
				sourceKey === 'festival'
					? {
							period:
								item.eventstartdate && item.eventenddate
									? `${item.eventstartdate} ~ ${item.eventenddate}`
									: '',
							venue: item.eventplace || '',
							playtime: item.playtime || '',
						}
					: {}

			return {
				id: `${sourceKey}-${item.contentid}`,
				sourceKey,
				sourceLabel: sourceMap[sourceKey].label,
				color: sourceMap[sourceKey].color,
				title: item.title || '이름 없음',
				image: item.firstimage2 || item.firstimage || '',
				address: item.addr1 || '주소 정보 없음',
				tel: item.tel || '',
				extraInfo,
				contentTypeId: item.contenttypeid || '',
				longitude,
				latitude,
			}
		})
		.filter(
			(item) =>
				Number.isFinite(item.longitude) &&
				Number.isFinite(item.latitude),
		)
}

const allPlaces = computed(() => {
	return Object.entries(sourceMap).flatMap(([sourceKey, source]) =>
		normalizePlaces(sourceKey, source.dataset),
	)
})

const activeCategory = ref('all')
const selectedPlace = ref(null)
const recommendedPlaces = ref([])

/**
 * 이전에 사용한 부산 표시 범위.
 * 배열에서는 [위도, 경도] 순서를 사용한다.
 */
const busanMapBounds = {
	west: 128.8,
	east: 129.29,
	south: 34.98,
	north: 35.385,
}

const leafletBounds = [
	[busanMapBounds.south, busanMapBounds.west],
	[busanMapBounds.north, busanMapBounds.east],
]

const filteredPlaces = computed(() => {
	if (activeCategory.value === 'all') {
		return allPlaces.value
	}

	return allPlaces.value.filter(
		(place) => place.sourceKey === activeCategory.value,
	)
})

function isInsideBusanBounds(place) {
	return (
		place.longitude >= busanMapBounds.west &&
		place.longitude <= busanMapBounds.east &&
		place.latitude >= busanMapBounds.south &&
		place.latitude <= busanMapBounds.north
	)
}

/**
 * 오류 좌표인 0,0이나 부산과 크게 떨어진 좌표는 지도에서 제외한다.
 */
const visiblePlaces = computed(() => {
	return filteredPlaces.value.filter(isInsideBusanBounds)
})

/* Leaflet 관련 상태 */
const leafletMapRef = ref(null)

let leafletMap = null
let markerLayer = null

const markerByPlaceId = new Map()

function initializeLeafletMap() {
	if (!leafletMapRef.value || leafletMap) {
		return
	}

	leafletMap = L.map(leafletMapRef.value, {
		zoomControl: false,
		minZoom: 9,
		maxZoom: 18,
		zoomSnap: 0.5,
		zoomDelta: 0.5,
		preferCanvas: true,
	})

	L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		minZoom: 0,
		maxZoom: 19,
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	}).addTo(leafletMap)

	markerLayer = L.layerGroup().addTo(leafletMap)

	resetZoom()
	renderLeafletMarkers()

	nextTick(() => {
		leafletMap?.invalidateSize()
	})
}

/**
 * 필터링된 장소를 Leaflet 마커로 다시 그린다.
 */
function renderLeafletMarkers() {
	if (!leafletMap || !markerLayer) {
		return
	}

	markerLayer.clearLayers()
	markerByPlaceId.clear()

	for (const place of visiblePlaces.value) {
		/*
		 * Leaflet 좌표 순서:
		 * [위도 latitude, 경도 longitude]
		 */
		const marker = L.circleMarker(
			[place.latitude, place.longitude],
			{
				radius: 7,
				color: '#ffffff',
				weight: 4,
				opacity: 1,
				fillColor: place.color,
				fillOpacity: 1,
			},
		)

		marker.bindTooltip(place.title, {
			direction: 'top',
			offset: [0, -8],
			opacity: 0.95,
		})

		marker.on('click', () => {
			selectPlace(place)
		})

		marker.addTo(markerLayer)
		markerByPlaceId.set(place.id, marker)
	}

	updateSelectedMarkerStyle()
}

/**
 * 선택된 마커만 더 크게 표시한다.
 */
function updateSelectedMarkerStyle() {
	for (const [placeId, marker] of markerByPlaceId.entries()) {
		const isSelected = selectedPlace.value?.id === placeId

		marker.setRadius(isSelected ? 10 : 7)

		marker.setStyle({
			weight: isSelected ? 6 : 4,
			fillOpacity: 1,
		})

		if (isSelected) {
			marker.bringToFront()
		}
	}
}

function pickRandomPlaces(pool, count) {
	const shuffled = [...pool].sort(() => Math.random() - 0.5)

	return shuffled.slice(
		0,
		Math.min(count, shuffled.length),
	)
}

function refreshRecommendations() {
	const pool = visiblePlaces.value

	recommendedPlaces.value = pickRandomPlaces(pool, 3)
}

function setCategory(categoryKey) {
	activeCategory.value = categoryKey
}

function selectPlace(place) {
	selectedPlace.value = place

	const marker = markerByPlaceId.get(place.id)

	if (marker) {
		marker.bringToFront()
		marker.openTooltip()
	}
}

function zoomIn() {
	leafletMap?.zoomIn(0.5)
}

function zoomOut() {
	leafletMap?.zoomOut(0.5)
}

function resetZoom() {
	leafletMap?.fitBounds(leafletBounds, {
		padding: [12, 12],
		animate: true,
	})
}

/**
 * 카테고리가 바뀌면 추천 장소와 지도 마커를 갱신한다.
 */
watch(
	visiblePlaces,
	() => {
		refreshRecommendations()
		renderLeafletMarkers()
	},
	{
		immediate: true,
	},
)

watch(selectedPlace, () => {
	updateSelectedMarkerStyle()
})

onMounted(() => {
	initializeLeafletMap()
})

onBeforeUnmount(() => {
	markerByPlaceId.clear()
	markerLayer = null

	if (leafletMap) {
		leafletMap.remove()
		leafletMap = null
	}
})
</script>

<template>
	<section id="place" class="busan-map-section">
		<header class="section-header">
			<div class="section-block">
				<p class="eyebrow">Busan visual map</p>
				<h2>부산지도</h2>
				<p class="description">
					관광지, 여행코스, 축제공연행사를 한 번에 보여줍니다.
				</p>
			</div>
			<div class="category-group" role="tablist" aria-label="부산 장소 카테고리 필터">
				<button
					v-for="category in categoryList"
					:key="category.key"
					type="button"
					class="category-button"
					:class="{ active: activeCategory === category.key }"
					@click="setCategory(category.key)"
				>
					<span>{{ category.label }}</span>
					<strong>{{ category.key === 'all' ? allPlaces.length : sourceMap[category.key].dataset.length }}</strong>
				</button>
			</div>
		</header>

		<div class="content-grid">
			<article class="map-panel">
				<div class="map-topline">
					<span class="map-title">부산 지도 시각화</span>
					<div class="map-controls">
						<span class="map-count">{{ visiblePlaces.length }}개 장소</span>
						<div class="zoom-controls" aria-label="지도 확대 축소">
							<button type="button" class="zoom-button" @click="zoomOut">-</button>
							<button
              type="button"
              class="zoom-button zoom-reset"
              @click="resetZoom"
            >
              초기화
            </button>
							<button type="button" class="zoom-button" @click="zoomIn">+</button>
						</div>
					</div>
				</div>

        <div
          ref="leafletMapRef"
          class="map-stage"
          aria-label="부산 장소 시각화 지도"
        ></div>

				<div v-if="selectedPlace" class="selected-card">
					<div class="selected-image-wrap">
						<img v-if="selectedPlace.image" :src="selectedPlace.image" :alt="selectedPlace.title" />
						<div v-else class="selected-image-fallback">사진 없음</div>
					</div>

					<div class="selected-meta">
						<p class="selected-badge">{{ selectedPlace.sourceLabel }}</p>
						<h3>{{ selectedPlace.title }}</h3>
						<p>{{ selectedPlace.address }}</p>
						<p v-if="selectedPlace.tel">{{ selectedPlace.tel }}</p>
						<p v-if="selectedPlace.extraInfo?.venue">{{ selectedPlace.extraInfo.venue }}</p>
						<p v-if="selectedPlace.extraInfo?.period">{{ selectedPlace.extraInfo.period }}</p>
						<p v-if="selectedPlace.extraInfo?.playtime">{{ selectedPlace.extraInfo.playtime }}</p>
					</div>
				</div>
			</article>

			<aside class="recommend-panel">
				<div class="recommend-header">
					<div>
						<p class="eyebrow">추천 장소</p>
						<h3>랜덤 추천 3곳</h3>
					</div>

					<button type="button" class="refresh-button" @click="refreshRecommendations">
						새로고침
					</button>
				</div>

				<p class="recommend-description">
					현재 필터 조건에 맞는 데이터에서 매번 무작위로 3개를 다시 뽑습니다.
				</p>

				<div class="recommend-list">
					<button
						v-for="place in recommendedPlaces"
						:key="place.id"
						type="button"
						class="recommend-card"
						@click="selectPlace(place)"
					>
						<div class="recommend-image-wrap">
							<img v-if="place.image" :src="place.image" :alt="place.title" />
							<div v-else class="recommend-image-fallback">사진 없음</div>
						</div>

						<div class="recommend-copy">
							<span class="recommend-tag">{{ place.sourceLabel }}</span>
							<strong>{{ place.title }}</strong>
							<small>{{ place.address }}</small>
						</div>
					</button>
				</div>

				<div v-if="recommendedPlaces.length === 0" class="empty-recommend">
					추천할 장소가 없습니다.
				</div>
			</aside>
		</div>
	</section>
</template>

<style scoped>
.busan-map-section {
	width: min(1280px, calc(100% - 32px));
	margin: 40px auto;
	padding: 28px;
	border-radius: 28px;
	background: #ffffff;
	border: 1px solid rgba(15, 23, 42, 0.08);
	box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
}

.section-header {
	display: grid;
	gap: 20px;
	margin-bottom: 22px;
}

.section-block {
	display: flex;
	flex-direction: column;
	gap: 0.35rem;
	padding: 1rem 1.25rem;
	border-radius: 22px;
	background: rgba(37, 99, 235, 0.06);
	border: 1px solid rgba(37, 99, 235, 0.14);
}

.section-block h2 {
	margin: 0;
	font-size: 1.8rem;
	color: #0f172a;
}

.eyebrow {
	margin: 0 0 8px;
	font-size: 0.8rem;
	letter-spacing: 0.16em;
	text-transform: uppercase;
	color: #2563eb;
	font-weight: 700;
}

.section-header h2,
.recommend-header h3 {
	margin: 0;
	color: #0f172a;
}

.description,
.recommend-description {
	margin: 10px 0 0;
	color: #475569;
}

.category-group {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 12px;
}

.category-button,
.refresh-button,
.map-marker,
.recommend-card {
	border: 0;
	cursor: pointer;
}

.category-button {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	padding: 14px 16px;
	border-radius: 18px;
	background: #ffffff;
	border: 1px solid rgba(37, 99, 235, 0.18);
	color: #1e293b;
	transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}

.category-button strong {
	min-width: 2rem;
	padding: 0.25rem 0.55rem;
	border-radius: 999px;
	text-align: center;
	background: rgba(255, 255, 255, 0.78);
}

.category-button.active {
	background: #2563eb;
	border-color: #2563eb;
	color: white;
	box-shadow: 0 14px 26px rgba(37, 99, 235, 0.22);
}

.category-button:hover,
.refresh-button:hover,
.recommend-card:hover {
	transform: translateY(-1px);
}

.content-grid {
	display: grid;
	grid-template-columns: minmax(0, 1.6fr) minmax(320px, 0.9fr);
	gap: 18px;
}

.map-panel,
.recommend-panel {
	border-radius: 24px;
	background: #ffffff;
	border: 1px solid rgba(15, 23, 42, 0.08);
	overflow: hidden;
}

.map-panel {
	padding: 18px;
}

.map-topline,
.recommend-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
}

.map-controls {
	display: flex;
	align-items: center;
	gap: 12px;
	flex-wrap: wrap;
}

.zoom-controls {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 6px;
	border-radius: 999px;
	border: 1px solid rgba(37, 99, 235, 0.18);
	background: #ffffff;
}

.zoom-button {
	min-width: 36px;
	height: 36px;
	padding: 0 10px;
	border-radius: 999px;
	border: 0;
	background: #2563eb;
	color: #ffffff;
	font-size: 1rem;
	font-weight: 700;
	box-shadow: 0 8px 18px rgba(37, 99, 235, 0.18);
}

.zoom-reset {
	min-width: 66px;
	font-size: 0.8rem;
}

.map-title,
.map-count {
	font-size: 0.95rem;
	color: #475569;
}

.map-count {
	font-weight: 700;
}

.map-stage {
	position: relative;
	width: 100%;
	height: 620px;
	margin-top: 14px;
	border-radius: 24px;
	overflow: hidden;
	background: #e2e8f0;
	border: 1px solid rgba(15, 23, 42, 0.08);
}



.map-stage.is-dragging {
	cursor: grabbing;
}

.map-stage.is-dragging .map-viewport {
	transition: none;
}

.map-viewport {
	position: absolute;
	top: 50%;
	left: 50%;
	width: calc(100% * var(--zoom-level, 1));
	height: calc(100% * var(--zoom-level, 1));
	transform: translate(calc(-50% + var(--pan-x, 0px)), calc(-50% + var(--pan-y, 0px)));
	transform-origin: center center;
	transition: width 0.2s ease, height 0.2s ease, transform 0.2s ease;
}

.map-background {
	position: absolute;
	inset: 0;
	display: block;
	width: 100%;
	height: 100%;
	object-fit: fill;
	pointer-events: none;
	user-select: none;
}

.map-background-overlay {
	position: absolute;
	inset: 0;
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.08));
	pointer-events: none;
}

.map-grid {
	position: absolute;
	inset: 0;
	background-image:
		linear-gradient(rgba(15, 23, 42, 0.05) 1px, transparent 1px),
		linear-gradient(90deg, rgba(15, 23, 42, 0.05) 1px, transparent 1px);
	background-size: 64px 64px;
	opacity: 0.5;
}

.map-glow {
	position: absolute;
	border-radius: 999px;
	filter: blur(22px);
	opacity: 0.55;
}

.map-glow-a {
	width: 260px;
	height: 260px;
	background: rgba(37, 99, 235, 0.12);
	top: 6%;
	right: 10%;
}

.map-glow-b {
	width: 240px;
	height: 240px;
	background: rgba(37, 99, 235, 0.1);
	bottom: 10%;
	left: 8%;
}

.map-marker {
	position: absolute;
	z-index: 2;
	padding: 0;
	background: transparent;
	transform: translate(-50%, -50%);
}

.marker-dot {
	display: inline-flex;
	width: 14px;
	height: 14px;
	border-radius: 50%;
	background: var(--marker-color, #2563eb);
	box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.78), 0 8px 18px rgba(15, 23, 42, 0.16);
	position: relative;
}

.marker-dot::after {
	content: '';
	position: absolute;
	inset: -5px;
	border-radius: 50%;
	border: 2px solid rgba(255, 255, 255, 0.9);
}

.marker-tooltip {
	position: absolute;
	left: 50%;
	bottom: calc(100% + 10px);
	transform: translateX(-50%);
	white-space: nowrap;
	padding: 0.45rem 0.65rem;
	border-radius: 999px;
	background: rgba(15, 23, 42, 0.92);
	color: white;
	font-size: 0.78rem;
	opacity: 0;
	pointer-events: none;
	transition: opacity 0.2s ease, transform 0.2s ease;
}

.map-stage :deep(.leaflet-container) {
	width: 100%;
	height: 100%;
	font-family: inherit;
}

.map-stage :deep(.leaflet-control-attribution) {
	font-size: 10px;
}

.map-marker:hover .marker-tooltip,
.map-marker.selected .marker-tooltip {
	opacity: 1;
	transform: translateX(-50%) translateY(-2px);
}

.map-marker.selected .marker-dot {
	box-shadow: 0 0 0 8px rgba(255, 255, 255, 0.85), 0 0 0 16px rgba(37, 99, 235, 0.12), 0 12px 24px rgba(15, 23, 42, 0.2);
}

.empty-state {
	position: absolute;
	inset: 0;
	display: grid;
	place-items: center;
	color: #64748b;
	font-weight: 600;
}

.selected-card {
	display: grid;
	grid-template-columns: 120px minmax(0, 1fr);
	gap: 14px;
	margin-top: 16px;
	padding-top: 16px;
	border-top: 1px solid rgba(15, 23, 42, 0.08);
}

.selected-image-wrap,
.recommend-image-wrap {
	overflow: hidden;
	border-radius: 18px;
	background: linear-gradient(135deg, #dbeafe, #e2e8f0);
}

.selected-image-wrap {
	aspect-ratio: 1 / 1;
}

.selected-image-wrap img,
.recommend-image-wrap img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	display: block;
}

.selected-image-fallback,
.recommend-image-fallback {
	display: grid;
	place-items: center;
	width: 100%;
	height: 100%;
	color: #334155;
	font-weight: 700;
}

.selected-meta h3 {
	margin: 8px 0;
}

.selected-meta p {
	margin: 4px 0 0;
	color: #475569;
}

.selected-badge,
.recommend-tag {
	display: inline-flex;
	align-items: center;
	padding: 0.3rem 0.55rem;
	border-radius: 999px;
	background: rgba(37, 99, 235, 0.1);
	color: #1d4ed8;
	font-size: 0.78rem;
	font-weight: 700;
}

.recommend-panel {
	padding: 18px;
}

.refresh-button {
	padding: 0.7rem 1rem;
	border-radius: 14px;
	background: #2563eb;
	color: white;
	font-weight: 700;
	box-shadow: 0 12px 24px rgba(37, 99, 235, 0.22);
}

.recommend-list {
	display: grid;
	gap: 12px;
	margin-top: 18px;
}

.recommend-card {
	display: grid;
	grid-template-columns: 92px minmax(0, 1fr);
	gap: 12px;
	padding: 12px;
	border-radius: 18px;
	background: #f8fafc;
	text-align: left;
	border: 1px solid rgba(15, 23, 42, 0.08);
	transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.recommend-card:hover {
	box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08);
}

.recommend-image-wrap {
	aspect-ratio: 1 / 1;
}

.recommend-copy {
	display: grid;
	align-content: center;
	gap: 6px;
}

.recommend-copy strong {
	color: #0f172a;
}

.recommend-copy small {
	color: #64748b;
}

.empty-recommend {
	margin-top: 18px;
	padding: 16px;
	border-radius: 18px;
	background: #f8fafc;
	color: #64748b;
	text-align: center;
}

@media (max-width: 1100px) {
	.content-grid {
		grid-template-columns: 1fr;
	}

	.recommend-panel {
		order: 2;
	}
}


@media (max-width: 760px) {
	.category-group {
		grid-template-columns: 1fr 1fr;
	}

	.map-stage {
		height: 420px;
	}

	.selected-card,
	.recommend-card {
		grid-template-columns: 1fr;
	}

	.recommend-image-wrap {
		aspect-ratio: 16 / 10;
	}
}
</style>