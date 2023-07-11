const $QuartPos = java('net.minecraft.core.QuartPos')
const $Climate = java('net.minecraft.world.level.biome.Climate')

function getClimate(block) {
	const targetPoint = block.level.minecraftLevel.chunkSource.generator.climateSampler().sample($QuartPos.fromBlock(block.x), $QuartPos.fromBlock(block.y), $QuartPos.fromBlock(block.z))
	return {
		continentalness:$Climate.unquantizeCoord(targetPoint.continentalness()),
		erosion:$Climate.unquantizeCoord(targetPoint.erosion()),
		temperature:$Climate.unquantizeCoord(targetPoint.temperature()),
		humidity:$Climate.unquantizeCoord(targetPoint.humidity()),
		weirdness:$Climate.unquantizeCoord(targetPoint.weirdness())
	}
}

onEvent('player.logged_in', event => {
	event.player.paint({
		climateBackground:{w:88,h:24,type:"rectangle",texture:"kubejs:textures/painter/weather.png",alignX:"right",alignY:"top",visible:false},
		temperatureArrow:{type:"item",item:"arrow",alignX:"right",alignY:"top",x:8,y:8,visible:false},
		humidityArrow:{type:"item",item:"arrow",alignX:"right",alignY:"top",x:-8,y:8,visible:false},
		erosionArrow:{type:"item",item:"arrow",alignX:"right",alignY:"top",x:-24,y:8,visible:false},
		weirdnessArrow:{type:"item",item:"arrow",alignX:"right",alignY:"top",x:-40,y:8,visible:false},
		continentalnessArrow:{type:"item",item:"arrow",alignX:"right",alignY:"top",x:-56,y:8,visible:false},
	})
})

onEvent('player.tick', event => {
	if (event.player.mainHandItem.id != "supplementaries:wind_vane") {
		event.player.paint({
			temperatureArrow:{ visible:false },
			humidityArrow:{ visible:false },
			erosionArrow:{ visible:false },
			continentalnessArrow:{ visible:false },
			weirdnessArrow:{ visible:false },
			climateBackground:{ visible:false },
		})
		return
	}

	const block = event.player.block
	const radius = 32
	const xz = getClimate(block.offset(-radius,0,-radius))
	const Xz = getClimate(block.offset(radius,0,-radius))
	const xZ = getClimate(block.offset(-radius,0,radius))
	const XZ = getClimate(block.offset(radius,0,radius))

	function getAngleFromPoints (xz,Xz,xZ,XZ) {
		const x = XZ+Xz-xZ-xz
		const z = XZ+xZ-Xz-xz
		return Math.atan2(z,x) + 3.14159/2*3
	}

	const temperatureAngle = getAngleFromPoints(xz.temperature,Xz.temperature,xZ.temperature,XZ.temperature)
	const humidityAngle = getAngleFromPoints(xz.humidity,Xz.humidity,xZ.humidity,XZ.humidity)
	const erosionAngle = getAngleFromPoints(-xz.erosion,-Xz.erosion,-xZ.erosion,-XZ.erosion)
	const continentalnessAngle = getAngleFromPoints(-xz.continentalness,-Xz.continentalness,-xZ.continentalness,-XZ.continentalness)
	const weirdnessAngle = getAngleFromPoints(xz.weirdness,Xz.weirdness,xZ.weirdness,XZ.weirdness)

	const playerAngle = event.player.yaw /180*3.14159

	event.player.paint({
		temperatureArrow:{ rotation: temperatureAngle-playerAngle-3.14159/4, visible:true },
		humidityArrow:{ rotation: humidityAngle-playerAngle-3.14159/4, visible:true },
		erosionArrow:{ rotation: erosionAngle-playerAngle-3.14159/4, visible:true },
		continentalnessArrow:{ rotation: continentalnessAngle-playerAngle-3.14159/4, visible:true },
		weirdnessArrow:{ rotation: weirdnessAngle-playerAngle-3.14159/4, visible:true },
		climateBackground:{ visible:true }
	}) // -3.14159/4 cause the arrow points up right
})