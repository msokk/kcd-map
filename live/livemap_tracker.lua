-- LiveMap tracker: periodically writes player position to kcd.log
-- Lines look like: [LIVEMAP] 2731.42 374.72 412.30 0.7071 -0.7071
-- (world X, Y, Z in meters, then facing direction X, Y)
-- An external tool tails kcd.log and feeds a live map.
--
-- Loaded by the engine as the mod init script (scripts/mods/<modid>.lua).
-- Script timers do not survive level loads, so the timer loop is re-armed
-- from the System.OnGameplayStarted event on every save load. The `gen`
-- counter kills stale loops so re-arming never produces duplicate lines.

LiveMap = LiveMap or {}
LiveMap.interval = 1000   -- ms between checks
LiveMap.minMoveSq = 1.0   -- skip logging if moved less than 1m since last line
LiveMap.gen = LiveMap.gen or 0

function LiveMap.Report()
	local p = player or g_localActor
	if (not p) or (not p.GetWorldPos) then
		return
	end
	local pos = p:GetWorldPos()
	if not pos then
		return
	end
	local last = LiveMap.lastPos
	if last then
		local dx = pos.x - last.x
		local dy = pos.y - last.y
		if (dx * dx + dy * dy) < LiveMap.minMoveSq then
			return
		end
	end
	LiveMap.lastPos = { x = pos.x, y = pos.y, z = pos.z }
	local dirx, diry = 0, 0
	if p.GetDirectionVector then
		local dir = p:GetDirectionVector()
		if dir then
			dirx, diry = dir.x, dir.y
		end
	end
	System.LogAlways(string.format("[LIVEMAP] %.2f %.2f %.2f %.4f %.4f", pos.x, pos.y, pos.z, dirx, diry))
end

function LiveMap.Arm()
	LiveMap.gen = LiveMap.gen + 1
	local myGen = LiveMap.gen
	local function tick()
		if myGen ~= LiveMap.gen then
			return
		end
		pcall(LiveMap.Report)
		Script.SetTimer(LiveMap.interval, tick)
	end
	Script.SetTimer(LiveMap.interval, tick)
end

-- Primary heartbeat: the LiveMap UIAction flowgraph (Libs/UI/UIActions/
-- livemap.xml) calls this once per second, starting on OnGameplayStarted.
-- Flowgraph state lives in the engine, unlike Script.SetTimer timers which
-- get wiped during save loads (which is why timer-based arming kept dying).
function LiveMap.FgTick()
	if not LiveMap.fgAlive then
		LiveMap.fgAlive = true
		System.LogAlways("[LIVEMAP] flowgraph heartbeat active")
	end
	pcall(LiveMap.Report)
end

-- Manual fallback for debugging: script-timer loop via console.
pcall(function()
	System.AddCCommand("livemap_arm", "LiveMap.Arm()", "Restart the LiveMap position timer")
end)
System.LogAlways("[LIVEMAP] init script loaded")
