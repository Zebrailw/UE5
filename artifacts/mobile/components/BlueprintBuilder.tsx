import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown, ZoomIn } from "react-native-reanimated";

import Colors from "@/constants/colors";
import { BuildChallenge, BuildConnection, BuildNode } from "@/data/curriculum";

const C = Colors.dark;
const { width: SCREEN_W } = Dimensions.get("window");

const PIN_TYPE_COLORS: Record<string, string> = {
  exec: "#FFFFFF",
  bool: "#CC0000",
  float: "#6ADE89",
  integer: "#5BC4FF",
  string: "#EF9A9A",
  object: "#00BCD4",
  vector: "#FFB74D",
};

const NODE_TYPE_COLORS: Record<string, string> = {
  event: "#B71C1C",
  function: "#1565C0",
  flow: "#4A148C",
  value: "#1B5E20",
  variable: "#E65100",
};

const NODE_W = 150;
const NODE_HEADER_H = 34;
const PIN_H = 28;
const PIN_DOT_SIZE = 12;

function getPinPos(node: BuildNode, pinId: string, side: "input" | "output") {
  const pins = side === "input" ? node.inputs : node.outputs;
  const idx = pins.findIndex((p) => p.id === pinId);
  if (idx < 0) return null;
  const x = side === "output" ? node.x + NODE_W : node.x;
  const y = node.y + NODE_HEADER_H + idx * PIN_H + PIN_H / 2;
  return { x, y };
}

interface WireProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

function Wire({ x1, y1, x2, y2, color }: WireProps) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length < 1) return null;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: cx - length / 2,
        top: cy - 2,
        width: length,
        height: 4,
        borderRadius: 2,
        backgroundColor: color,
        transform: [{ rotate: `${angle}deg` }],
        opacity: 0.9,
        shadowColor: color,
        shadowOpacity: 0.6,
        shadowRadius: 4,
        elevation: 2,
      }}
    />
  );
}

interface PinDotProps {
  pinId: string;
  type: string;
  label: string;
  side: "input" | "output";
  selected: boolean;
  connected: boolean;
  onPress: (pinId: string) => void;
}

function PinDot({ pinId, type, label, side, selected, connected, onPress }: PinDotProps) {
  const color = PIN_TYPE_COLORS[type] || C.tint;
  const isExec = type === "exec";
  return (
    <Pressable
      style={[styles.pinRow, side === "output" && styles.pinRowRight]}
      onPress={() => onPress(pinId)}
    >
      {side === "input" && (
        <View
          style={[
            styles.pinDot,
            {
              borderColor: color,
              backgroundColor: connected ? color : "transparent",
              transform: [{ scale: selected ? 1.4 : 1 }],
              borderWidth: selected ? 3 : 2,
            },
            isExec && styles.pinDotExec,
          ]}
        />
      )}
      <Text
        style={[
          styles.pinLabel,
          { color: connected ? color : C.textSecondary },
          side === "output" && { textAlign: "right" },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {side === "output" && (
        <View
          style={[
            styles.pinDot,
            {
              borderColor: color,
              backgroundColor: connected ? color : "transparent",
              transform: [{ scale: selected ? 1.4 : 1 }],
              borderWidth: selected ? 3 : 2,
            },
            isExec && styles.pinDotExec,
          ]}
        />
      )}
    </Pressable>
  );
}

interface NodeCardProps {
  node: BuildNode;
  selectedPin: string | null;
  connections: BuildConnection[];
  onPinPress: (nodeId: string, pinId: string, side: "input" | "output") => void;
}

function NodeCard({ node, selectedPin, connections, onPinPress }: NodeCardProps) {
  const headerColor = NODE_TYPE_COLORS[node.nodeType] || C.card;
  return (
    <View
      style={[
        styles.nodeCard,
        {
          left: node.x,
          top: node.y,
          width: NODE_W,
          shadowColor: headerColor,
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        },
      ]}
    >
      <View style={[styles.nodeHeader, { backgroundColor: headerColor }]}>
        <Text style={styles.nodeTitle} numberOfLines={1}>
          {node.title}
        </Text>
        {node.subtitle && (
          <Text style={styles.nodeSubtitle} numberOfLines={1}>
            {node.subtitle}
          </Text>
        )}
      </View>
      <View style={styles.nodePins}>
        <View style={styles.pinsCol}>
          {node.inputs.map((pin) => {
            const connected = connections.some(
              (c) => c.toNodeId === node.id && c.toPinId === pin.id
            );
            const selected = selectedPin === `${node.id}__IN__${pin.id}`;
            return (
              <PinDot
                key={pin.id}
                pinId={`${node.id}__IN__${pin.id}`}
                type={pin.type}
                label={pin.label}
                side="input"
                selected={selected}
                connected={connected}
                onPress={() => onPinPress(node.id, pin.id, "input")}
              />
            );
          })}
        </View>
        <View style={styles.pinsCol}>
          {node.outputs.map((pin) => {
            const connected = connections.some(
              (c) => c.fromNodeId === node.id && c.fromPinId === pin.id
            );
            const selected = selectedPin === `${node.id}__OUT__${pin.id}`;
            return (
              <PinDot
                key={pin.id}
                pinId={`${node.id}__OUT__${pin.id}`}
                type={pin.type}
                label={pin.label}
                side="output"
                selected={selected}
                connected={connected}
                onPress={() => onPinPress(node.id, pin.id, "output")}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

interface Props {
  challenge: BuildChallenge;
  modColor?: string;
  onComplete?: (connections: BuildConnection[]) => void;
}

type CheckState = "idle" | "success" | "fail";

export default function BlueprintBuilder({ challenge, modColor = C.tint, onComplete }: Props) {
  const [connections, setConnections] = useState<BuildConnection[]>([]);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [checkState, setCheckState] = useState<CheckState>("idle");
  const [showHint, setShowHint] = useState(false);

  const canvasH = Math.max(
    ...challenge.nodes.map((n) => n.y + NODE_HEADER_H + Math.max(n.inputs.length, n.outputs.length) * PIN_H + 40),
    280
  );
  const canvasW = Math.max(
    ...challenge.nodes.map((n) => n.x + NODE_W + 40),
    SCREEN_W - 40
  );

  const handlePinPress = useCallback(
    async (nodeId: string, pinId: string, side: "input" | "output") => {
      const key = `${nodeId}__${side === "input" ? "IN" : "OUT"}__${pinId}`;

      if (!selectedPin) {
        await Haptics.selectionAsync();
        setSelectedPin(key);
        setCheckState("idle");
        return;
      }

      if (selectedPin === key) {
        setSelectedPin(null);
        return;
      }

      const parsePin = (k: string) => {
        const parts = k.split("__");
        return { nodeId: parts[0], dir: parts[1] as "IN" | "OUT", pinId: parts[2] };
      };

      const from = parsePin(selectedPin);
      const to = { nodeId, dir: side === "input" ? ("IN" as const) : ("OUT" as const), pinId };

      if (from.dir === to.dir) {
        setSelectedPin(key);
        return;
      }

      const outPin = from.dir === "OUT" ? from : to;
      const inPin = from.dir === "IN" ? from : to;

      const alreadyExists = connections.some(
        (c) =>
          c.fromNodeId === outPin.nodeId &&
          c.fromPinId === outPin.pinId &&
          c.toNodeId === inPin.nodeId &&
          c.toPinId === inPin.pinId
      );

      if (alreadyExists) {
        await Haptics.selectionAsync();
        setConnections((prev) =>
          prev.filter(
            (c) =>
              !(
                c.fromNodeId === outPin.nodeId &&
                c.fromPinId === outPin.pinId &&
                c.toNodeId === inPin.nodeId &&
                c.toPinId === inPin.pinId
              )
          )
        );
        setSelectedPin(null);
        return;
      }

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setConnections((prev) => [
        ...prev.filter(
          (c) => !(c.toNodeId === inPin.nodeId && c.toPinId === inPin.pinId)
        ),
        {
          fromNodeId: outPin.nodeId,
          fromPinId: outPin.pinId,
          toNodeId: inPin.nodeId,
          toPinId: inPin.pinId,
        },
      ]);
      setSelectedPin(null);
      setCheckState("idle");
    },
    [selectedPin, connections]
  );

  const handleCheck = async () => {
    const { solution } = challenge;
    const allCorrect = solution.every((sol) =>
      connections.some(
        (c) =>
          c.fromNodeId === sol.fromNodeId &&
          c.fromPinId === sol.fromPinId &&
          c.toNodeId === sol.toNodeId &&
          c.toPinId === sol.toPinId
      )
    );
    if (allCorrect && connections.length >= solution.length) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCheckState("success");
      onComplete?.(connections);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setCheckState("fail");
      onComplete?.(connections);
    }
  };

  const handleReset = async () => {
    await Haptics.selectionAsync();
    setConnections([]);
    setSelectedPin(null);
    setCheckState("idle");
  };

  return (
    <View style={styles.container}>
      <View style={styles.instructionCard}>
        <View style={styles.instructionHeader}>
          <Feather name="cpu" size={16} color={modColor} />
          <Text style={[styles.instructionLabel, { color: modColor }]}>Задание</Text>
        </View>
        <Text style={styles.instructionText}>{challenge.instruction}</Text>
      </View>

      {selectedPin && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.selectedHint}>
          <Feather name="radio" size={12} color={C.tint} />
          <Text style={styles.selectedHintText}>
            Пин выбран — нажмите на другой пин для соединения
          </Text>
          <Pressable onPress={() => setSelectedPin(null)}>
            <Feather name="x" size={14} color={C.textSecondary} />
          </Pressable>
        </Animated.View>
      )}

      <View style={styles.canvasWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={!selectedPin}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            scrollEnabled={!selectedPin}
          >
            <View style={{ width: canvasW, height: canvasH }}>
              {connections.map((conn, i) => {
                const fromNode = challenge.nodes.find((n) => n.id === conn.fromNodeId);
                const toNode = challenge.nodes.find((n) => n.id === conn.toNodeId);
                if (!fromNode || !toNode) return null;
                const fromPos = getPinPos(fromNode, conn.fromPinId, "output");
                const toPos = getPinPos(toNode, conn.toPinId, "input");
                if (!fromPos || !toPos) return null;
                const fromPin = fromNode.outputs.find((p) => p.id === conn.fromPinId);
                const wireColor = PIN_TYPE_COLORS[fromPin?.type || "exec"] || C.tint;
                return (
                  <Wire
                    key={i}
                    x1={fromPos.x}
                    y1={fromPos.y}
                    x2={toPos.x}
                    y2={toPos.y}
                    color={wireColor}
                  />
                );
              })}
              {challenge.nodes.map((node) => (
                <NodeCard
                  key={node.id}
                  node={node}
                  selectedPin={selectedPin}
                  connections={connections}
                  onPinPress={handlePinPress}
                />
              ))}
            </View>
          </ScrollView>
        </ScrollView>

        <View style={styles.canvasLegend}>
          <Feather name="move" size={11} color={C.textTertiary} />
          <Text style={styles.legendText}>Прокрутите для просмотра</Text>
        </View>
      </View>

      {checkState === "success" && (
        <Animated.View entering={ZoomIn.duration(350)} style={styles.resultSuccess}>
          <LinearGradient
            colors={[C.success + "30", "transparent"]}
            style={StyleSheet.absoluteFill}
          />
          <Feather name="check-circle" size={22} color={C.success} />
          <View>
            <Text style={styles.resultTitle}>Правильно!</Text>
            <Text style={styles.resultSub}>Blueprint построен верно</Text>
          </View>
        </Animated.View>
      )}

      {checkState === "fail" && (
        <Animated.View entering={FadeIn.duration(250)} style={styles.resultFail}>
          <Feather name="alert-circle" size={20} color={C.error} />
          <View>
            <Text style={styles.resultFailTitle}>Не совсем верно</Text>
            <Text style={styles.resultFailSub}>Проверьте соединения и попробуйте снова</Text>
          </View>
        </Animated.View>
      )}

      <View style={styles.controls}>
        <Pressable
          style={styles.hintBtn}
          onPress={() => setShowHint((v) => !v)}
        >
          <Feather name="help-circle" size={15} color={C.textSecondary} />
          <Text style={styles.hintBtnText}>Подсказка</Text>
        </Pressable>
        <Pressable style={styles.resetBtn} onPress={handleReset}>
          <Feather name="refresh-cw" size={15} color={C.textSecondary} />
          <Text style={styles.resetBtnText}>Сбросить</Text>
        </Pressable>
        <Pressable
          style={[styles.checkBtn, { backgroundColor: modColor }]}
          onPress={handleCheck}
        >
          <Feather name="check" size={15} color={C.background} />
          <Text style={styles.checkBtnText}>Проверить</Text>
        </Pressable>
      </View>

      {showHint && (
        <Animated.View entering={FadeInDown.duration(250)} style={styles.hintCard}>
          <Feather name="info" size={14} color={C.warning} />
          <Text style={styles.hintText}>{challenge.hint}</Text>
        </Animated.View>
      )}

      <View style={styles.typeLegend}>
        <Text style={styles.typeLegendTitle}>Типы пинов:</Text>
        <View style={styles.typeLegendRow}>
          {Object.entries(PIN_TYPE_COLORS).slice(0, 5).map(([type, color]) => (
            <View key={type} style={styles.typeLegendItem}>
              <View style={[styles.typeDot, { backgroundColor: color }]} />
              <Text style={styles.typeLabel}>{type}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  instructionCard: {
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  instructionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  instructionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  instructionText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: C.text,
    lineHeight: 21,
  },
  selectedHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.tint + "22",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.tint + "44",
  },
  selectedHintText: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: C.tint,
  },
  canvasWrapper: {
    backgroundColor: "#060B11",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    height: 260,
    marginBottom: 12,
    overflow: "hidden",
  },
  canvasLegend: {
    position: "absolute",
    bottom: 8,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    opacity: 0.5,
  },
  legendText: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    color: C.textTertiary,
  },
  nodeCard: {
    position: "absolute",
    backgroundColor: "#0D1520",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1E2D40",
    overflow: "hidden",
    minWidth: NODE_W,
  },
  nodeHeader: {
    height: NODE_HEADER_H,
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  nodeTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    color: "#FFFFFF",
  },
  nodeSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 9,
    color: "rgba(255,255,255,0.7)",
  },
  nodePins: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  pinsCol: {
    flex: 1,
  },
  pinRow: {
    flexDirection: "row",
    alignItems: "center",
    height: PIN_H,
    paddingHorizontal: 6,
    gap: 5,
  },
  pinRowRight: {
    justifyContent: "flex-end",
  },
  pinDot: {
    width: PIN_DOT_SIZE,
    height: PIN_DOT_SIZE,
    borderRadius: PIN_DOT_SIZE / 2,
    borderWidth: 2,
  },
  pinDotExec: {
    borderRadius: 2,
    width: 10,
    height: 10,
  },
  pinLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 9,
    flex: 1,
  },
  controls: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  hintBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  hintBtnText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: C.textSecondary,
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  resetBtnText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: C.textSecondary,
  },
  checkBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 10,
    paddingVertical: 10,
  },
  checkBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: C.background,
  },
  resultSuccess: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.success + "22",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.success + "55",
    overflow: "hidden",
  },
  resultTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: C.success,
  },
  resultSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: C.textSecondary,
  },
  resultFail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.error + "22",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.error + "55",
  },
  resultFailTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: C.error,
  },
  resultFailSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: C.textSecondary,
  },
  hintCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: C.warning + "18",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.warning + "44",
  },
  hintText: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: C.text,
    lineHeight: 20,
  },
  typeLegend: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  typeLegendTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: C.textSecondary,
    marginBottom: 8,
  },
  typeLegendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  typeLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typeLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    color: C.textSecondary,
  },
});
