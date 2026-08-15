import { StyleSheet, Text, View } from "react-native";

interface FooterProps {
    dark?: boolean;
}

export default function Footer({ dark }: FooterProps) {
    return (
        <View style={styles.footerContainer}>
            <View style={[styles.divider, dark && styles.dividerDark]} />
            <View style={styles.content}>
                <Text style={[styles.developedBy, dark && styles.textDark]}>
                    Developed by <Text style={[styles.authorName, dark && styles.authorNameDark]}>Aashmeet Singh</Text>
                </Text>
                <Text style={[styles.internshipText, dark && styles.textDark]}>
                    Built during Talking Crooks internship
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    footerContainer: {
        paddingVertical: 18,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 8,
        marginBottom: 16,
    },
    divider: {
        width: "36%",
        height: 1,
        backgroundColor: "#E2E8F0",
        marginBottom: 10,
    },
    dividerDark: {
        backgroundColor: "#334155",
    },
    content: {
        alignItems: "center",
    },
    developedBy: {
        fontSize: 12,
        fontWeight: "600",
        color: "#64748B",
    },
    textDark: {
        color: "#94A3B8",
    },
    authorName: {
        fontWeight: "800",
        color: "#0F172A",
    },
    authorNameDark: {
        color: "#FFFFFF",
    },
    internshipText: {
        fontSize: 11,
        color: "#94A3B8",
        marginTop: 2,
        fontWeight: "500",
    },
});